import * as Comlink from 'comlink';
import { array, literal, object, safeParse, string, union, type Output } from 'valibot';
import {
	ProblemResponse,
	type ProblemRequest,
	type ProblemRequestType,
	type ProblemResponseType
} from './components/types';
import init from './main.wasm?init';
import './wasm_exec.js';

declare class Go {
	argv: string[];
	env: Record<string, string>;
	exit: (code: number) => void;
	importObject: WebAssembly.Imports;
	exited: boolean;
	mem: DataView;

	run(instance: WebAssembly.Instance): Promise<void>;
}

export interface WasmWorker {
	parse(latex: string): Promise<Output<typeof ParseResponse>>;
	generate(problem: ProblemRequestType): Promise<ProblemResponseType>;
	stream(problem: ProblemRequestType): Promise<ReadableStream<string>>;
}

const go = new Go();

const ParseResponse = union([
	object({
		success: literal(true),
		latex: string(),
		symbols: array(string())
	}),
	object({ success: literal(false), error: string() })
]);

const waInit = init(go.importObject)
	.then((res) => {
		void go.run(res);
		self.postMessage('WASM initialized');
	})
	.catch((e) => console.error(e));

const obj: {
	parse(latex: string): Promise<Output<typeof ParseResponse>>;
	stream(problem: Output<typeof ProblemRequest>): Promise<ReadableStream<string[]>>;
} = {
	async parse(latex: string) {
		await waInit; // ensure that WASM is initialized

		const response = safeParse(ParseResponse, JSON.parse(self.mrm_parse(latex)));
		if (response.success) {
			return response.output;
		} else {
			return { success: false, error: 'unable to parse expression' };
		}
	},
	async stream(problem: Output<typeof ProblemRequest>) {
		await waInit; // ensure that WASM is initialized
		const response = self.mrm_stream(JSON.stringify(problem));

		// Errors can be returned in the problem
		if (response instanceof ReadableStream) {
			return Comlink.transfer(response, [response]);
		} else {
			const parsed = safeParse(ProblemResponse, JSON.parse(response));
			if (parsed.success && !parsed.output.success) {
				throw new Error(parsed.output.error);
			} else {
				throw new Error('Unhandled error');
			}
		}
	}
};

Comlink.expose(obj);
