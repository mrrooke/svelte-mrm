const defaultConfig: MathQuill.v3.Config = {
	spaceBehavesLikeTab: true,
	leftRightIntoCmdGoes: 'up',
	restrictMismatchedBrackets: true,
	sumStartsWithNEquals: true,
	supSubsRequireOperand: true,
	charsThatBreakOutOfSupSub: '+-=<>',
	autoSubscriptNumerals: true,
	autoCommands: 'pi theta sqrt sum in notin neq',
	autoOperatorNames: 'sin cos tan NotEqual Prime Coprime Composite Even Odd CommonFactors Square',
	maxDepth: 10
};

export function mathquill(node: HTMLElement, config: MathQuill.v3.Config) {
	const customConfig: MathQuill.v3.Config = { ...defaultConfig, ...config };

	const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
	MQ.MathField(node, customConfig);
}

export function staticMathField(node: HTMLElement, config?: MathQuill.v3.Config) {
	const customConfig: MathQuill.v3.Config = { ...defaultConfig, ...config };
	const MQ = window.MathQuill.getInterface(3) as MathQuill.v3.API;
	const instance = MQ.StaticMath(node);
	if (instance.innerFields.length > 0) {
		instance.innerFields.map((e) => e.config(customConfig));
	}
}
