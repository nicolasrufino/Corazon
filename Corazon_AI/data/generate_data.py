# data/generate_data.py
#
# PURPOSE: Generate synthetic training data for two ML models.
#
# MODEL 1 — Time/Impact Regressor
#   Predicts: hours lost per year broken into navigation burden
#   and poverty premium (converted to hours via BLS Hispanic wage)
#   Input features: immigration status, number of goals, language,
#                   average goal difficulty
#   Output labels: nav_hours, poverty_hours, total_hours_lost,
#                  lifetime_hours, lifetime_days
#
# MODEL 2 — Personalization Classifier
#   Predicts: whether a given org is relevant to a given user (yes/no)
#   Input features: goal overlap, language match, eligibility match,
#                   zip match
#   Output label: relevant (1 = yes, 0 = no)
#
# WHY SYNTHETIC: We have no real user data yet. We encode domain
# knowledge about immigrant resource barriers directly into the data.
# As real users come in, this data gets replaced with actual observations.
#
# WAGE CONVERSION SOURCE:
#   BLS Usual Weekly Earnings of Wage and Salary Workers, Q2 2024
#   Hispanic full-time median weekly earnings: $903
#   $903 ÷ 40 hours = $22.58/hr
#   This converts every dollar of poverty premium into hours of life.

import pandas as pd
import numpy as np
import os
import random

random.seed(42)
np.random.seed(42)

os.makedirs("data", exist_ok=True)


# ── PART 1: TIME/IMPACT TRAINING DATA ───────────────────────────────────────

print("Generating time/impact training data...")

STATUS_VALUES   = ["undocumented", "DACA", "permanent_resident", "citizen"]
LANGUAGE_VALUES = ["es", "en"]
GOAL_COUNTS     = [1, 2, 3, 4, 5]

# BASE HOURS PER GOAL — anchored to real research:
#
# The Center for American Progress (2022) found Americans collectively
# spend 11.5 billion hours on federal paperwork annually — averaging
# 45 hours per adult per year across ALL government interactions.
# That 45-hour figure is our baseline for a citizen with no barriers.
#
# legal: 18 hrs
#   USCIS disability applications average 232 days to process (SSA 2024).
#   Immigration applications involve lawyers, fees, months of waiting.
#
# healthcare: 14 hrs
#   Medicaid recertification alone can involve 47-page forms (Health
#   Affairs, 2020). Over 1 in 4 eligible people not enrolled due to
#   enrollment barriers (CBPP, 2022).
#
# benefits: 12 hrs
#   40% of eligible SNAP recipients cited paperwork as deterrent,
#   37% said too time-consuming (CAP, 2022). TANF has lowest
#   participation rate (18%) of any safety net program (Urban
#   Institute, 2023).
#
# housing: 9 hrs
#   Only 25% of eligible families receive housing assistance.
#   Waitlists typically thousands of people and years long (CAP).
#
# employment: 7 hrs
#   Gig economy income documentation is a known barrier for Latino
#   workers (CBPP, 2022). Work authorization confusion adds friction.

GOAL_BASE_HOURS = {
    "legal":       18.0,
    "healthcare":  14.0,
    "benefits":    12.0,
    "housing":      9.0,
    "employment":   7.0
}

ALL_GOALS = list(GOAL_BASE_HOURS.keys())

# STATUS MULTIPLIERS — how much harder each system is to navigate:
#
# Undocumented (2.4x):
#   Fear, ineligibility for most programs, documentation requirements
#   that actively exclude them. PMC (2015) found "complicated
#   bureaucracies created insurmountable barriers" specifically.
#
# DACA (1.8x):
#   Some legal standing but constant policy uncertainty. Ineligible
#   for federal benefits like Medicaid in most states.
#
# Permanent resident (1.3x):
#   Eligible for most programs after 5-year bar, but still faces
#   language barriers and public charge fear.
#
# Citizen (1.0x):
#   The research baseline — 45 hrs/year average American.

STATUS_MULTIPLIERS = {
    "undocumented":       2.4,
    "DACA":               1.8,
    "permanent_resident": 1.3,
    "citizen":            1.0
}

# LANGUAGE PENALTY — added hours when user's primary language is Spanish:
#
# Most federal and state systems default to English-only: phone systems,
# forms, websites, staff. CAP (2022) documented translated versions of
# forms frequently unavailable. We set this at 8 hours/year — roughly
# one additional full workday — conservative given interpreter wait
# times alone can run 45 min to 2+ hours per single interaction (LEP.gov).

LANGUAGE_PENALTY = {
    "es": 8.0,
    "en": 0.0
}

# POVERTY PREMIUM — extra dollars spent annually due to lack of access.
# This is the "ghetto tax" documented by Brookings Institution.
#
# food: $600/yr
#   Brookings (2022): deeply poor spend $3,138/yr on food vs $4,559
#   for middle income — but poor pay MORE per unit at convenience
#   stores and gas stations in food deserts.
#
# transport: $400/yr
#   Brookings (2022): middle income spends 120% more on transportation
#   than deeply poor, but deeply poor pay higher share of income and
#   spend more time traveling to reach affordable options.
#
# banking: $200/yr
#   Check cashers charge 1-3% per check. Payday loans average 400%
#   APR. Unbanked immigrants pay $40-50/month just to cash paychecks.
#
# healthcare: $800/yr
#   Uninsured immigrants pay full price for care they do access.
#   Single ER visit averages $1,200-$2,000.
#
# wage_gap: $4,000/yr
#   Lack of credential recognition and work auth restrictions push
#   immigrants into lower-wage work even when overqualified.

POVERTY_PREMIUM_BASE = {
    "food":       600,
    "transport":  400,
    "banking":    200,
    "healthcare": 800,
    "wage_gap":  4000,
}

MONEY_STATUS_MULTIPLIER = {
    "undocumented":       2.8,
    "DACA":               1.9,
    "permanent_resident": 1.3,
    "citizen":            1.0
}

MONEY_LANGUAGE_MULTIPLIER = {
    "es": 1.4,
    "en": 1.0
}

# BLS Q2 2024: Hispanic median weekly earnings $903 ÷ 40hrs = $22.58/hr
# This converts every dollar of poverty premium into hours of life.
# Source: BLS Usual Weekly Earnings of Wage and Salary Workers, July 2024
HISPANIC_MEDIAN_HOURLY = 22.58

rows = []

for status in STATUS_VALUES:
    for language in LANGUAGE_VALUES:
        for num_goals in GOAL_COUNTS:

            goal_combinations = []
            for _ in range(8):
                sampled = random.sample(ALL_GOALS, num_goals)
                goal_combinations.append(sampled)

            for goals in goal_combinations:
                # navigation hours
                avg_base = sum(GOAL_BASE_HOURS[g] for g in goals) / len(goals)
                multiplied = avg_base * STATUS_MULTIPLIERS[status]
                nav_hours = multiplied + LANGUAGE_PENALTY[language]
                noise_h = np.random.normal(0, 1.2)
                nav_hours = max(1.0, round(nav_hours + noise_h, 1))

                # poverty premium in dollars then converted to hours
                base_money = sum(POVERTY_PREMIUM_BASE.values())
                money_lost = (
                    base_money
                    * MONEY_STATUS_MULTIPLIER[status]
                    * MONEY_LANGUAGE_MULTIPLIER[language]
                )
                noise_m = np.random.normal(0, 200)
                money_lost = max(0, money_lost + noise_m)

                # key conversion: dollars → hours of life at BLS wage
                poverty_hours = round(money_lost / HISPANIC_MEDIAN_HOURLY, 1)

                # unified total
                total_hours_lost = round(nav_hours + poverty_hours, 1)

                # 20-year projection
                lifetime_hours = round(total_hours_lost * 20, 0)

                # convert to days (8hr workday) for display
                lifetime_days = round(lifetime_hours / 8, 1)

                rows.append({
                    "status_bucket":       status,
                    "num_goals":           num_goals,
                    "language":            language,
                    "avg_goal_difficulty": round(avg_base, 2),
                    "nav_hours":           nav_hours,
                    "poverty_hours":       poverty_hours,
                    "total_hours_lost":    total_hours_lost,
                    "lifetime_hours":      lifetime_hours,
                    "lifetime_days":       lifetime_days
                })

df_time = pd.DataFrame(rows)
df_time = df_time.sample(frac=1, random_state=42).reset_index(drop=True)

df_time.to_csv("data/time_training_data.csv", index=False)
print(f"  Saved {len(df_time)} rows → data/time_training_data.csv")
print(f"  Total hours range: {df_time['total_hours_lost'].min()} – {df_time['total_hours_lost'].max()}")
print(f"  Lifetime days range: {df_time['lifetime_days'].min()} – {df_time['lifetime_days'].max()}")
print(f"  Sample:\n{df_time.head(3).to_string()}\n")


# ── PART 2: PERSONALIZATION TRAINING DATA ───────────────────────────────────
#
# This model answers: "Is this org a good match for this user?"
# It outputs a probability (0 to 1) and we rank orgs by that score.
#
# Features:
#   goal_overlap (0-5):     how many of user's goals this org serves
#   language_match (0/1):   org offers services in user's language
#   eligibility_match (0/1): org serves people with this status
#   zip_match (0/1):        org is in approximately the same area
#
# Labeling logic encodes real-world reasoning about what matters most
# when connecting a vulnerable person to a resource.

print("Generating personalization training data...")

pers_rows = []

for goal_overlap in range(0, 6):
    for language_match in [0, 1]:
        for eligibility_match in [0, 1]:
            for zip_match in [0, 1]:

                # no goal overlap → irrelevant no matter what else matches
                if goal_overlap == 0:
                    label = 0

                # strong overlap (4-5) → relevant unless BOTH access
                # factors fail
                elif goal_overlap >= 4:
                    if language_match == 0 and eligibility_match == 0:
                        label = 0
                    else:
                        label = 1

                # good overlap (3) → relevant if at least one
                # access factor matches
                elif goal_overlap == 3:
                    if eligibility_match == 1 or language_match == 1:
                        label = 1
                    else:
                        label = 0

                # moderate overlap (2) → relevant only if eligibility
                # matches and at least one other factor does too
                elif goal_overlap == 2:
                    if eligibility_match == 1 and language_match == 1:
                        label = 1
                    elif eligibility_match == 1 and zip_match == 1:
                        label = 1
                    else:
                        label = 0

                # weak overlap (1) → only relevant if eligibility AND
                # language both match
                else:
                    if eligibility_match == 1 and language_match == 1:
                        label = 1
                    else:
                        label = 0

                for _ in range(12):
                    noise = np.random.choice([-1, 0, 0, 0, 1])
                    noisy_overlap = max(0, min(5, goal_overlap + noise))

                    final_label = label
                    if noisy_overlap == 0 and goal_overlap > 0:
                        final_label = 0

                    pers_rows.append({
                        "goal_overlap":      noisy_overlap,
                        "language_match":    language_match,
                        "eligibility_match": eligibility_match,
                        "zip_match":         zip_match,
                        "relevant":          final_label
                    })

df_pers = pd.DataFrame(pers_rows)
df_pers = df_pers.sample(frac=1, random_state=42).reset_index(drop=True)

df_pers.to_csv("data/personalization_training_data.csv", index=False)
print(f"  Saved {len(df_pers)} rows → data/personalization_training_data.csv")
print(f"  Class balance: {df_pers['relevant'].value_counts().to_dict()}")
print(f"  Sample:\n{df_pers.head(3).to_string()}\n")

print("Data generation complete. Run train_models.py next.")