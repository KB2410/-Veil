import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  credential(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  addEligible(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  addEligibleCredential(context: __compactRuntime.CircuitContext<PS>,
                        nonce_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeSurvey(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  submit(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getTallies(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint[]>;
}

export type ProvableCircuits<PS> = {
  addEligible(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  addEligibleCredential(context: __compactRuntime.CircuitContext<PS>,
                        nonce_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeSurvey(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  submit(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getTallies(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint[]>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  addEligible(context: __compactRuntime.CircuitContext<PS>,
              commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  addEligibleCredential(context: __compactRuntime.CircuitContext<PS>,
                        nonce_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  closeSurvey(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  submit(context: __compactRuntime.CircuitContext<PS>, rating_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  getTallies(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, bigint[]>;
}

export type Ledger = {
  readonly organizer: Uint8Array;
  readonly surveyOpen: boolean;
  eligibleCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly ratingOne: bigint;
  readonly ratingTwo: bigint;
  readonly ratingThree: bigint;
  readonly ratingFour: bigint;
  readonly ratingFive: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
