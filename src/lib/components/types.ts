export type DomainType = DiscreteDomain | IntegerDomain;

export interface IntegerDomain {
	type: 'integer';
	active: boolean;
	low: number;
	high: number;
	variable: string;
	err: string | undefined;
}

export interface DiscreteDomain {
	type: 'discrete';
	active: boolean;
	variable: string;
	values: string[] | number[];
	err: string | undefined;
}

export interface Constraint {
	active: boolean;
	expression: string;
	symbols: string[];
	err: string | undefined;
	edited: boolean;
	id: number;
}

export interface ProblemOptions {
	multSymbol: '\\cdot' | '\\times';
	negativeParenthesis: boolean;
	printOneMult: boolean;
	printZeroAdd: boolean;
	collapseNegatives: boolean;
	lexicalOrder: boolean;
}

export interface ProblemRequest {
	expression: string;
	domains: DomainType[];
	constraints: Constraint[];
	options: ProblemOptions;
}

export interface ProblemResponse {
	error: string | undefined;
	questions: string[] | undefined;
}

export type BorderRadius =
	| 'var(--radius-1)'
	| 'var(--radius-2)'
	| 'var(--radius-3)'
	| 'var(--radius-4)'
	| 'var(--radius-5)'
	| 'var(--radius-6)'
	| 'var(--radius-round)'
	| 'var(--radius-conditional-1)'
	| 'var(--radius-conditional-2)'
	| 'var(--radius-conditional-3)'
	| 'var(--radius-conditional-4)'
	| 'var(--radius-conditional-5)'
	| 'var(--radius-conditional-6)';
