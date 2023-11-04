import {
	union,
	object,
	literal,
	boolean,
	number,
	string,
	optional,
	array,
	type Output
} from 'valibot';

export const IntegerDomain = object({
	type: literal('integer'),
	active: boolean(),
	low: number(),
	high: number(),
	variable: string(),
	err: optional(string())
});

export const DiscreteDomain = object({
	type: literal('discrete'),
	active: boolean(),
	variable: string(),
	values: array(union([string(), number()])),
	err: optional(string())
});

export const Domain = union([DiscreteDomain, IntegerDomain]);

export const Constraint = object({
	active: boolean(),
	expression: string(),
	symbols: array(string()),
	err: optional(string()),
	edited: boolean(),
	id: number()
});

export const ProblemOptions = object({
	multSymbol: union([literal('\\cdot'), literal('\\times')]),
	negativeParenthesis: boolean(),
	printOneMult: boolean(),
	printZeroAdd: boolean(),
	collapseNegatives: boolean(),
	lexicalOrder: boolean()
});

export const ProblemRequest = object({
	expression: string(),
	domains: array(Domain),
	constraints: array(Constraint),
	options: ProblemOptions
});

export const ProblemResponse = union([
	object({
		success: literal(false),
		error: string()
	}),
	object({
		success: literal(true),
		questions: array(string())
	})
]);

export type DiscreteDomainType = Output<typeof DiscreteDomain>;
export type IntegerDomainType = Output<typeof IntegerDomain>;
export type DomainType = Output<typeof Domain>;
export type ConstraintType = Output<typeof Constraint>;
export type ProblemOptionsType = Output<typeof ProblemOptions>;
export type ProblemRequestType = Output<typeof ProblemRequest>;
export type ProblemResponseType = Output<typeof ProblemResponse>;
