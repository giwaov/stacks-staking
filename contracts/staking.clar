;; Staking Contract - Stake STX and earn rewards
;; Built with @stacks/transactions

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_NOTHING_STAKED (err u102))
(define-constant REWARD_RATE u5) ;; 5% APY simplified

;; Data vars
(define-data-var total-staked uint u0)
(define-data-var staker-count uint u0)

;; Maps
(define-map stakes principal {
  amount: uint,
  start-block: uint,
  rewards-claimed: uint
})

;; Read-only functions
(define-read-only (get-total-staked)
  (var-get total-staked))

(define-read-only (get-staker-count)
  (var-get staker-count))

(define-read-only (get-stake (staker principal))
  (map-get? stakes staker))

(define-read-only (calculate-rewards (staker principal))
  (match (map-get? stakes staker)
    stake-data
    (let (
      (blocks-staked (- block-height (get start-block stake-data)))
      (reward (/ (* (get amount stake-data) REWARD_RATE blocks-staked) u100000))
    )
      reward)
    u0))

;; Public functions
(define-public (stake (amount uint))
  (let ((current-stake (map-get? stakes tx-sender)))
    (asserts! (> amount u0) ERR_INSUFFICIENT_BALANCE)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (match current-stake
      existing
      (map-set stakes tx-sender {
        amount: (+ (get amount existing) amount),
        start-block: (get start-block existing),
        rewards-claimed: (get rewards-claimed existing)
      })
      (begin
        (map-set stakes tx-sender {
          amount: amount,
          start-block: block-height,
          rewards-claimed: u0
        })
        (var-set staker-count (+ (var-get staker-count) u1))))
    (var-set total-staked (+ (var-get total-staked) amount))
    (ok amount)))

(define-public (unstake (amount uint))
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) ERR_NOTHING_STAKED))
    (staked-amount (get amount stake-data))
  )
    (asserts! (<= amount staked-amount) ERR_INSUFFICIENT_BALANCE)
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (if (is-eq amount staked-amount)
      (begin
        (map-delete stakes tx-sender)
        (var-set staker-count (- (var-get staker-count) u1)))
      (map-set stakes tx-sender (merge stake-data { amount: (- staked-amount amount) })))
    (var-set total-staked (- (var-get total-staked) amount))
    (ok amount)))

(define-public (claim-rewards)
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) ERR_NOTHING_STAKED))
    (rewards (calculate-rewards tx-sender))
  )
    (asserts! (> rewards u0) ERR_INSUFFICIENT_BALANCE)
    (map-set stakes tx-sender (merge stake-data {
      rewards-claimed: (+ (get rewards-claimed stake-data) rewards),
      start-block: block-height
    }))
    (ok rewards)))

;; ===== COMPOUND & EMERGENCY FEATURES =====

;; Compound rewards back into stake
(define-public (compound-rewards)
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) ERR_NOTHING_STAKED))
    (rewards (calculate-rewards tx-sender))
  )
    (asserts! (> rewards u0) ERR_INSUFFICIENT_BALANCE)
    (map-set stakes tx-sender {
      amount: (+ (get amount stake-data) rewards),
      start-block: block-height,
      rewards-claimed: (get rewards-claimed stake-data)
    })
    (var-set total-staked (+ (var-get total-staked) rewards))
    (ok rewards)))

;; Emergency withdraw (forfeits pending rewards)
(define-public (emergency-withdraw)
  (let (
    (stake-data (unwrap! (map-get? stakes tx-sender) ERR_NOTHING_STAKED))
    (amount (get amount stake-data))
  )
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (map-delete stakes tx-sender)
    (var-set total-staked (- (var-get total-staked) amount))
    (var-set staker-count (- (var-get staker-count) u1))
    (ok amount)))

;; Get estimated APY based on current parameters
(define-read-only (get-estimated-apy)
  (* REWARD_RATE u100)) ;; Returns basis points

;; Get time until next reward checkpoint
(define-read-only (get-stake-duration (staker principal))
  (match (map-get? stakes staker)
    stake-data (- block-height (get start-block stake-data))
    u0))

;; Check if user has active stake
(define-read-only (is-staking (staker principal))
  (is-some (map-get? stakes staker)))
