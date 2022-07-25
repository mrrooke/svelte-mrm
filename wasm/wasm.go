package main

import (
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/mrrooke/calc"
	"github.com/mrrooke/calc/expression"
)

func main() {
	js.Global().Set("mrm_parse", js.FuncOf(input))
	js.Global().Set("mrm_generate", js.FuncOf(generate))

	// Leave a channel open to ensure this program
	// is running when called from JavaScript land
	c := make(chan struct{}, 0)
	<-c
}

func generate(_ js.Value, args []js.Value) any {

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
	fmt.Println(p)
	if err != nil {
		return newError(err.Error())
	}

	// 1. Generate the problem set
	exprs, err := calc.Generate(p.Expression, p.Domains, p.Constraints)

	if err != nil {
		return newError(err.Error())
	}

	ltx := make([]string, len(exprs))

	// 2. Produce array of latex expressions, applying ctx args
	for i, expr := range exprs {
		ltx[i] = expr.Beautify(p.Context).Latex(&p.Context)
	}

	type res struct {
		Questions []string `json:"questions"`
	}

	j, err := json.Marshal(res{Questions: ltx})
	if err != nil {
		return newError(err.Error())
	}

	return js.ValueOf(string(j))
}

func newError(msg string) js.Value {
	type errorStruct struct {
		Error string `json:"error"`
	}
	resp, err := json.Marshal(errorStruct{
		Error: msg,
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
		fmt.Println(err.Error())
		return newError(err.Error())
	}
	symb := make([]string, len(symbols))
	i := 0
	for s := range symbols {
		symb[i] = s
		i++
	}

	type resp struct {
		Latex   string   `json:"latex"`
		Symbols []string `json:"symbols"`
	}
	payload := resp{
		Latex:   res.Simplify().Beautify(ctx).Latex(&ctx),
		Symbols: symb,
	}

	j, err := json.Marshal(payload)
	if err != nil {
		return newError(err.Error())
	}
	return js.ValueOf(string(j))
}
