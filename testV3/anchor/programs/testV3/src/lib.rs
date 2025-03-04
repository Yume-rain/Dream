#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod testV3 {
  use super::*;

  pub fn initialize_poll(ctx: Context<InitializePoll>, 
    poll_id: u64,
    description: String,
    poll_start: u64,
    poll_end: u64,) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    
    poll.poll_id = poll_id;
    poll.poll_description = description;
    poll.poll_start = poll_start;
    poll.poll_end = poll_end;
    poll.candidates_vote = 0;
    poll.candidate_amount = 0;
    Ok(())
  }

  pub fn initialize_candidate(ctx: Context<InitializeCandidate>, 
    candidate_name: String,
    
    poll_id: u64) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    let poll = &mut ctx.accounts.poll;
    poll.candidate_amount += 1;
    candidate.candidate_name = candidate_name;
    candidate.candidates_vote = 0;
    Ok(())
  }

  pub fn vote(ctx: Context<Vote>, candidate_name: String) -> Result<()> {
    let candidate = &mut ctx.accounts.candidate;
    candidate.candidates_vote += 1;
    
    Ok(())
  }


}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(
    init,
    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump,
  )]
  pub poll: Account<'info, Poll>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
  pub poll_id: u64,
  #[max_len(32)]
  pub poll_name: String,
  #[max_len(32)]
  pub poll_description: String,
  pub poll_start: u64,
  pub poll_end: u64,
  pub poll_amount: u64,
  pub candidate_amount: u64,
  pub candidates_vote: u64,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeCandidate<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  #[account(
    init,
    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
    bump
  )]
  pub candidate: Account<'info, Candidate>,

  pub poll: Account<'info, Poll>,
  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
  
  #[max_len(32)]
  pub candidate_name: String,

  pub candidates_vote: u64,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct Vote<'info> {
  //#[account]
  pub signer: Signer<'info>,
  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll: Account<'info, Poll>,
  #[account(
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
    bump
  )]
  pub candidate: Account<'info, Candidate>,
  
  pub system_program: Program<'info, System>,
}