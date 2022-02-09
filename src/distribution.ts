export interface PdfOptions {
    log?: boolean;
};

export interface CdfOptions {
    lower?: boolean;
    log?: boolean;
};

export interface RandomSource {
    random: () => number;
};

export interface Distribution {
    name: string;

    pdf(x : number, options?: PdfOptions) : number;

    cdf(x : number, options?: CdfOptions) : number;

    random(rng: RandomSource) : number;
    random(rng: RandomSource, n: number) : number[];

};