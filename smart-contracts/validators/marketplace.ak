use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/string
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
}

pub type Redeemer {
  msg: ByteArray,
}

validator marketplace {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    trace @"redeemer": string.from_bytearray(redeemer.msg)

    expect Some(Datum { owner }) = datum

    let must_be_sign = list.has(tx.extra_signatories, owner)

    must_be_sign?
  }

  else(_) {
    fail
  }
}

test scenario_1() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
  let redeemer = Redeemer { msg: "Aiken Rocks!" }
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
  marketplace.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    transaction.placeholder,
  )
}

test scenario_2() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
  let redeemer = Redeemer { msg: "17925" }
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
  marketplace.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    transaction.placeholder,
  )
}

test scenario_3() {
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
  let redeemer = Redeemer { msg: "17925" }
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }
  marketplace.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },
  )
}
