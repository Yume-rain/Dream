'use client'

import { getTestV3Program, getTestV3ProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useTestV3Program() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTestV3ProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTestV3Program(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['testV3', 'all', { cluster }],
    queryFn: () => program.account.testV3.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['testV3', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ testV3: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useTestV3ProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTestV3Program()

  const accountQuery = useQuery({
    queryKey: ['testV3', 'fetch', { cluster, account }],
    queryFn: () => program.account.testV3.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['testV3', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ testV3: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['testV3', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ testV3: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['testV3', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ testV3: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['testV3', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ testV3: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
