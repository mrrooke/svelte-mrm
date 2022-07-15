export type Domain = {
	id: string;
	type: 'integer' | 'rational' | 'real' | 'discrete';
	low: number;
	high: number;
	variable: string;
};
export type Constraint = {
	active: boolean;
	expression: string;
	id: number;
};
export type ProblemRequest = {
	expression: string;
	domains: Domain[];
	constraints: Constraint[];
};

export type ProblemResponse = {
	error: string | undefined;
	questions: string[] | undefined;
};