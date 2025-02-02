import * as anchor from '@coral-xyz/anchor';
import {Program} from '@coral-xyz/anchor';
import {Keypair} from '@solana/web3.js';
import {PublicKey} from '@solana/web3.js';
import {TestV3} from '../target/types/testV3';
import {startAnchor} from "solana-bankrun";
import {BankrunProvider} from "anchor-bankrun";
import exp from 'constants';
//import {testProgram} from '../target/idl/testV3';
import { Buffer } from 'buffer';

const IDL = require('../target/idl/testV3.json');

const testAddress = new anchor.web3.PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF');
//const testProgram = new Program<TestV3>(IDL, testAddress);
let context;
let provider;
//let testProgram;

describe('testV3', () => {
  // Configure the client to use the local cluster.
  //const provider = anchor.AnchorProvider.env()
  //anchor.setProvider(provider)
  //const payer = provider.wallet as anchor.Wallet

  //const program = anchor.workspace.TestV3 as Program<TestV3>
  let context;
  let provider;
  let testProgram: Program<TestV3>;

  beforeAll(async ()=> {
    context = await startAnchor("tests/anchor-example", 
      [{name: "testV3", programId: testAddress}], []);
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);
    testProgram = new anchor.Program<TestV3>(IDL, provider);});
    
    it('Initializes poll', async () => {
    await testProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite color?",
      new anchor.BN(0),
      new anchor.BN(114514114514),
    ).rpc();

    const [pollAdress] = await PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      testAddress
    )

    const poll = await testProgram.account.poll.fetch(pollAdress);
    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite color?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate", async () => {
    await testProgram.methods.initializeCandidate(
      new anchor.BN(1),
      "Red",
    ).rpc();
    const [redAddress] = await PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8) ,Buffer.from("Red")],
      testAddress
    );
    const redCandidate = await testProgram.account.candidate.fetch(redAddress);
    console.log(redCandidate);
    expect(redCandidate.pollId.toNumber()).toEqual(1);
  });

  it("vote", async () => {
    await testProgram.methods.vote(
      "Red",
    ).rpc();

    
  });
    // The account should no longer exist, returning null.

});
