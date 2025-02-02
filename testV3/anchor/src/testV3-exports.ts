// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TestV3IDL from '../target/idl/testV3.json'
import type { TestV3 } from '../target/types/testV3'

// Re-export the generated IDL and type
export { TestV3, TestV3IDL }

// The programId is imported from the program IDL.
export const TEST_V3_PROGRAM_ID = new PublicKey(TestV3IDL.address)

// This is a helper function to get the TestV3 Anchor program.
export function getTestV3Program(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...TestV3IDL, address: address ? address.toBase58() : TestV3IDL.address } as TestV3, provider)
}

// This is a helper function to get the program ID for the TestV3 program depending on the cluster.
export function getTestV3ProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the TestV3 program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return TEST_V3_PROGRAM_ID
  }
}
