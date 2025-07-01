terraform {
  backend "gcs" {
    bucket = "lf-dev-tf-state"
    prefix = "tf-state/dev/luca-ledger"
  }
}