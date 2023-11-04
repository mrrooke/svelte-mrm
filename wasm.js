import { exec } from 'child_process';

const opts = {
	cwd: 'wasm/',
	env: {
		...process.env,
		GOPATH: process.env.GOPATH,
		GOROOT: process.env.GOROOT,
		GOOS: 'js',
		GOARCH: 'wasm'
	}
};

const outFile = `../src/lib/main.wasm`;
const args = ['go build', '-o', outFile, 'wasm.go'];

exec(args.join(' '), opts, function (error, stdout, stderr) {
	console.log(stdout, stderr, error);
});
