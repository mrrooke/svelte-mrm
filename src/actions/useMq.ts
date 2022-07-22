export function mathquill(node: HTMLElement, config: MathQuill.v3.Config) {
	const defaultConfig: MathQuill.v3.Config = {
		spaceBehavesLikeTab: true,
		leftRightIntoCmdGoes: 'up',
		restrictMismatchedBrackets: true,
		sumStartsWithNEquals: true,
		supSubsRequireOperand: true,
		charsThatBreakOutOfSupSub: '+-=<>',
		autoSubscriptNumerals: true,
		autoCommands: 'pi theta sqrt sum in notin neq',
		autoOperatorNames: 'sin cos tan',
		maxDepth: 10
	};

	const customConfig: MathQuill.v3.Config = { ...defaultConfig, ...config };

	const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
	MQ.MathField(node, customConfig);
}

export function staticMathField(node: HTMLElement) {
	const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
	MQ.StaticMath(node);
}
