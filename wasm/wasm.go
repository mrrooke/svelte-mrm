package main

import (
	"encoding/json"
	"syscall/js"

	"github.com/mrrooke/calc"
	"github.com/mrrooke/calc/expression"
)

func main() {

	js.Global().Set("mrm_parse", js.FuncOf(input))
	js.Global().Set("mrm_generate", js.FuncOf(generate))
	js.Global().Set("mrm_stream", MyGeneratornc())

	// Leave a channel open to ensure this program
	// is running when called from JavaScript land
	<-make(chan struct{})
}

func generate(_ js.Value, args []js.Value) any {
	type res struct {
		Success   bool     `json:"success"`
		Questions []string `json:"questions"`
	}

	if len(args) != 1 {
		return newError("generate takes 1 argument")
	}

	latex := args[0]

	if latex.IsNull() || latex.IsUndefined() {
		return newError("argument is null or undefined")
	}
	if args[0].Type() != js.TypeString {
		return newError("input must be a string JSON object")
	}
	// 0. Unmarshal JSON to problem struct
	var p calc.Problem

	err := json.Unmarshal([]byte(args[0].String()), &p)

	if err != nil {
		return newError(err.Error())
	}

	// 1. Generate the problem set
	batches, err := calc.Generate(p.Expression, p.Domains, p.Constraints)

	if err != nil {
		return newError(err.Error())
	}

	// 2. Produce array of latex expressions, applying ctx args
	for exprs := range batches {
		ltx := make([]string, len(exprs))
		i := 0
		for _, expr := range exprs {
			ltx[i] = expr.Beautify(p.Context).Latex(&p.Context)
			i++
		}

		j, err := json.Marshal(res{Success: true, Questions: ltx})

		if err != nil {
			return newError(err.Error())
		}
		js.Global().Call("postMessage", js.ValueOf(string(j)))
	}

	success, err := json.Marshal(res{Success: true, Questions: []string{}})

	if err != nil {
		return newError(err.Error())
	}

	js.Global().Call("postMessage", js.ValueOf("done"))
	return js.ValueOf(js.ValueOf(string(success)))
}

func newError(msg string) js.Value {
	type errorStruct struct {
		Success bool   `json:"success"`
		Error   string `json:"error"`
	}
	resp, err := json.Marshal(errorStruct{
		Success: false,
		Error:   msg,
	})
	if err != nil {
		panic(err)
	}
	return js.ValueOf(string(resp))
}

func input(_ js.Value, args []js.Value) any {
	ctx := expression.Context{
		MultSymbol:          "\\times",
		NegativeParenthesis: false,
		PrintOneMult:        false,
		PrintZeroAdd:        false,
		CollapseNegatives:   true,
		LexicalOrder:        false,
	}
	if len(args) != 1 {
		return newError("error: input(source) takes a single argument")
	}

	latex := args[0]
	if latex.IsNull() || latex.IsUndefined() {
		return newError("latex input is null or undefined")
	}
	if latex.Type() != js.TypeString {
		return newError("latex input is null or undefined")
	}

	res, symbols, err := calc.Read(latex.String())
	if err != nil {
		return newError(err.Error())
	}
	symb := make([]string, len(symbols))
	i := 0
	for s := range symbols {
		symb[i] = s
		i++
	}

	type resp struct {
		Success bool     `json:"success"`
		Latex   string   `json:"latex"`
		Symbols []string `json:"symbols"`
	}
	payload := resp{
		Success: true,
		Latex:   res.Simplify().Beautify(ctx).Latex(&ctx),
		Symbols: symb,
	}

	j, err := json.Marshal(payload)
	if err != nil {
		return newError(err.Error())
	}
	return js.ValueOf(string(j))
}

// MyGoFunc fetches an external resource by making a HTTP request from Go
// The JavaScript method accepts one argument, which is the URL to request
func MyGeneratornc() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {

		type res struct {
			Success   bool     `json:"success"`
			Questions []string `json:"questions"`
		}
		// Get the URL as argument
		// args[0] is a js.Value, so we need to get a string out of it
		stringified := args[0]

		if stringified.IsNull() || stringified.IsUndefined() {
			return newError("argument is null or undefined")
		}

		if stringified.Type() != js.TypeString {
			return newError("input must be a stringified JSON Object")
		}

		// 0. Unmarshal JSON to problem struct
		var p calc.Problem

		err := json.Unmarshal([]byte(args[0].String()), &p)

		if err != nil {
			return newError(err.Error())
		}

		// 1. Generate the problem set
		batches, err := calc.Generate(p.Expression, p.Domains, p.Constraints)

		if err != nil {
			return newError(err.Error())
		}

		// Create the "underlyingSource" object for the ReadableStream constructor
		// See: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream
		underlyingSource := map[string]interface{}{
			// start method
			"start": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				// The first and only arg is the controller object
				// controller := args[0]

				return nil
			}),
			// use the pull method to push data to the stream and allow async generation of problems, rather than
			// blocking on creating all response.
			"pull": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				controller := args[0]

				// Process the stream in yet another background goroutine,
				// because we can't block on a goroutine invoked by JS in Wasm
				// that is dealing with HTTP requests
				go func() {
					// Read the entire stream and pass it to JavaScript
					exprs := <-batches

					if len(exprs) == 0 {
						// If an empty solution is found close the stream
						controller.Call("close")
						return
					}
					ltx := make([]string, len(exprs))
					i := 0
					for _, expr := range exprs {
						ltx[i] = expr.Beautify(p.Context).Latex(&p.Context)
						i++
					}

					j, err := json.Marshal(res{Success: true, Questions: ltx})

					if err != nil {
						// Tell the controller we have an error
						// We're ignoring "EOF" however, which means the stream was done
						errorConstructor := js.Global().Get("Error")
						errorObject := errorConstructor.New(err.Error())
						controller.Call("error", errorObject)
						return
					}
					controller.Call("enqueue", js.ValueOf(string(j)))

				}()

				return nil

			}),
			// cancel method
			"cancel": js.FuncOf(func(this js.Value, args []js.Value) interface{} {
				// If the request is canceled, just close the body
				return nil
			}),
		}

		// Create a ReadableStream object from the underlyingSource object
		readableStreamConstructor := js.Global().Get("ReadableStream")
		return readableStreamConstructor.New(underlyingSource)

	})
}
