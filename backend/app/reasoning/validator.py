from typing import List, Dict, Any
from app.schemas.evidence import EvidenceUnit, SourceType
from app.schemas.reasoning import ReasoningResult


class Validator:

    # Reasoning & Safety Layer: Enforced Logic and Factual Integrity.

    # 1. Prevent AI Hallucination: It acts as a gatekeeper that only allows
    #    claims backed by retrieved EvidenceUnits.
    # 2. Separate Reasoning from Generation: It decides 'what' is true based
    #    on data, while the Generation layer later decides 'how' to say it.

    def validate(
        self,
        evidence: List[EvidenceUnit],
        sector: str,
        geography: str,
        funding_stage: str,
    ) -> ReasoningResult:

        # Validates potential conclusions against the provided evidence units.

        supported_claims = []
        rejected_claims = []
        evidence_map: Dict[str, List[str]] = {}

        geo_norm = (
            geography.lower().split("-")[0].strip()
        )  # "India" from "India - Pan India"

        # --- Rule 1: Market Opportunity ---
        market_claim = f"Market growth and demand for {sector} in {geography}"
        supporting_news = [
            ev.evidence_id
            for ev in evidence
            if (
                ev.source_type == SourceType.NEWS
                or ev.source_type == SourceType.DATASET
            )
            and any(
                tag in ev.usage_tags
                for tag in [
                    "market-sizing",
                    "funding-trends",
                    "market-growth",
                    "demand",
                    "sector-opportunity",
                ]
            )
        ]
        if supporting_news:
            supported_claims.append(market_claim)
            evidence_map[market_claim] = supporting_news
        else:
            rejected_claims.append(market_claim)

        policy_claim = f"Regulatory framework and policy support in {geography}"
        supporting_policy = [
            ev.evidence_id
            for ev in evidence
            if ev.source_type == SourceType.POLICY
            and (geo_norm in ev.geography.lower() or ev.geography.lower() == "global")
            and any(
                tag in ev.usage_tags
                for tag in [
                    "regulation",
                    "policy-impact",
                    "favorable",
                    "legal",
                    "government-grant",
                ]
            )
        ]
        if supporting_policy:
            supported_claims.append(policy_claim)
            evidence_map[policy_claim] = supporting_policy
        else:
            rejected_claims.append(policy_claim)

        funding_claim = f"Availability of {funding_stage} capital for {sector} startups"
        supporting_funding = [
            ev.evidence_id
            for ev in evidence
            if any(
                tag in ev.usage_tags
                for tag in ["valuation", "exit-metrics", "funding-trends", "deal-flow"]
            )
        ]
        if supporting_funding:
            supported_claims.append(funding_claim)
            evidence_map[funding_claim] = supporting_funding
        else:
            rejected_claims.append(funding_claim)

        investor_claim = f"Active investor interest and thesis alignment"
        supporting_investor_data = [
            ev.evidence_id
            for ev in evidence
            if (
                len(ev.investors) > 0
                or "investor-sentiment" in ev.usage_tags
                or "active-investors" in ev.usage_tags
            )
        ]
        if supporting_investor_data:
            supported_claims.append(investor_claim)
            evidence_map[investor_claim] = supporting_investor_data
        else:
            rejected_claims.append(investor_claim)

        ecosystem_claim = f"Ecosystem maturity for {sector} startups in {geography}"
        supporting_ecosystem = [
            ev.evidence_id
            for ev in evidence
            if "ecosystem" in ev.usage_tags
            or "maturity" in ev.usage_tags
            or len(evidence) > 5
        ]
        if supporting_ecosystem:
            supported_claims.append(ecosystem_claim)
            evidence_map[ecosystem_claim] = supporting_ecosystem
        else:
            rejected_claims.append(ecosystem_claim)

        total_claims = len(supported_claims) + len(rejected_claims)
        support_ratio = len(supported_claims) / max(total_claims, 1)

        if support_ratio > 0.7:
            confidence = "high"
        elif support_ratio > 0.4:
            confidence = "medium"
        else:
            confidence = "low"

        return ReasoningResult(
            supported_claims=supported_claims,
            rejected_claims=rejected_claims,
            confidence_level=confidence,
            support_ratio=support_ratio,
            evidence_map=evidence_map,
        )
