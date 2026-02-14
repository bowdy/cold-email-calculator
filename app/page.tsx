"use client";

import { useState, useMemo } from "react";

const SMARTLEAD_PLANS = [
  { name: "Basic", monthly: 39, annual: 32.5, emailsPerMonth: 6_000 },
  { name: "Pro", monthly: 94, annual: 78.3, emailsPerMonth: 150_000 },
  { name: "Custom", monthly: 174, annual: 144.5, emailsPerMonth: 500_000 },
];

const LEAD_FINDER_COST = 59;
const INBOXES_PER_DOMAIN = 3;
const EMAILS_PER_INBOX_PER_DAY = 10;
const DAYS_PER_MONTH = 30;
const EMAILS_PER_DOMAIN_PER_MONTH =
  INBOXES_PER_DOMAIN * EMAILS_PER_INBOX_PER_DAY * DAYS_PER_MONTH; // 900

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default function Home() {
  const [emailsPerMonth, setEmailsPerMonth] = useState(5000);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [domainCostPerYear, setDomainCostPerYear] = useState(10);
  const [inboxCostPerMonth, setInboxCostPerMonth] = useState(3.5);

  const calculations = useMemo(() => {
    const domainsNeeded = Math.max(1, Math.ceil(emailsPerMonth / EMAILS_PER_DOMAIN_PER_MONTH));
    const inboxesNeeded = domainsNeeded * INBOXES_PER_DOMAIN;
    const actualCapacity = domainsNeeded * EMAILS_PER_DOMAIN_PER_MONTH;

    const smartleadPlan =
      SMARTLEAD_PLANS.find((p) => p.emailsPerMonth >= emailsPerMonth) ??
      SMARTLEAD_PLANS[SMARTLEAD_PLANS.length - 1];

    const smartleadCost = billingCycle === "monthly" ? smartleadPlan.monthly : smartleadPlan.annual;
    const domainsMonthlyCost = (domainsNeeded * domainCostPerYear) / 12;
    const inboxesMonthlyCost = inboxesNeeded * inboxCostPerMonth;
    const totalMonthlyCost = domainsMonthlyCost + inboxesMonthlyCost + smartleadCost + LEAD_FINDER_COST;
    const totalAnnualCost = totalMonthlyCost * 12;

    return {
      domainsNeeded,
      inboxesNeeded,
      actualCapacity,
      smartleadPlan,
      smartleadCost,
      domainsMonthlyCost,
      inboxesMonthlyCost,
      totalMonthlyCost,
      totalAnnualCost,
    };
  }, [emailsPerMonth, billingCycle, domainCostPerYear, inboxCostPerMonth]);

  const sliderToEmails = (val: number) => {
    if (val <= 50) return Math.round((val / 50) * 10000);
    if (val <= 80) return Math.round(10000 + ((val - 50) / 30) * 90000);
    return Math.round(100000 + ((val - 80) / 20) * 400000);
  };

  const emailsToSlider = (emails: number) => {
    if (emails <= 10000) return (emails / 10000) * 50;
    if (emails <= 100000) return 50 + ((emails - 10000) / 90000) * 30;
    return 80 + ((emails - 100000) / 400000) * 20;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Cold Email Infrastructure Cost Calculator
        </h1>
        <p className="mb-8 text-gray-500">
          Calculate your total monthly cost for domains, inboxes, and Smartlead.
        </p>

        {/* Billing Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === "annual" ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-gray-900" : "text-gray-400"}`}>
            Annual
          </span>
          {billingCycle === "annual" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save ~17%
            </span>
          )}
        </div>

        {/* Email Volume Slider */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Emails per month
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={emailsToSlider(emailsPerMonth)}
              onChange={(e) => setEmailsPerMonth(sliderToEmails(Number(e.target.value)))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
            <input
              type="number"
              min={100}
              max={500000}
              value={emailsPerMonth}
              onChange={(e) => {
                const val = Math.max(100, Math.min(500000, Number(e.target.value) || 100));
                setEmailsPerMonth(val);
              }}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-right text-sm font-mono"
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>100</span>
            <span>500,000</span>
          </div>
        </div>

        {/* Cost Inputs */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Domain cost (per year)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min={0.5}
                max={50}
                step={0.5}
                value={domainCostPerYear}
                onChange={(e) => setDomainCostPerYear(Number(e.target.value) || 0)}
                className="w-full rounded border-0 bg-transparent py-1 text-lg font-semibold text-gray-900 focus:outline-none"
              />
            </div>
            <span className="text-xs text-gray-400">Namecheap avg</span>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Inbox cost (per month)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min={0.5}
                max={20}
                step={0.5}
                value={inboxCostPerMonth}
                onChange={(e) => setInboxCostPerMonth(Number(e.target.value) || 0)}
                className="w-full rounded border-0 bg-transparent py-1 text-lg font-semibold text-gray-900 focus:outline-none"
              />
            </div>
            <span className="text-xs text-gray-400">Premium Inboxes</span>
          </div>
        </div>

        {/* Infrastructure Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Infrastructure Required</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{calculations.domainsNeeded}</div>
              <div className="text-sm text-gray-500">Domains</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{calculations.inboxesNeeded}</div>
              <div className="text-sm text-gray-500">Inboxes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(calculations.actualCapacity)}
              </div>
              <div className="text-sm text-gray-500">Email capacity/mo</div>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            {INBOXES_PER_DOMAIN} inboxes per domain &middot; {EMAILS_PER_INBOX_PER_DAY} emails per inbox per day &middot; {DAYS_PER_MONTH} days/month
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Monthly Cost Breakdown</h2>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Domains ({calculations.domainsNeeded} &times; {formatCurrency(domainCostPerYear)}/yr)
                </div>
                <div className="text-xs text-gray-400">Namecheap</div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(calculations.domainsMonthlyCost)}/mo
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Inboxes ({calculations.inboxesNeeded} &times; {formatCurrency(inboxCostPerMonth)}/mo)
                </div>
                <div className="text-xs text-gray-400">Premium Inboxes</div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(calculations.inboxesMonthlyCost)}/mo
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Smartlead {calculations.smartleadPlan.name} Plan
                </div>
                <div className="text-xs text-gray-400">
                  Up to {formatNumber(calculations.smartleadPlan.emailsPerMonth)} emails/mo
                  {billingCycle === "annual" && (
                    <span className="ml-1 text-green-600">
                      (save {formatCurrency(calculations.smartleadPlan.monthly - calculations.smartleadPlan.annual)}/mo)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(calculations.smartleadCost)}/mo
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Smartlead Lead Finder
                </div>
                <div className="text-xs text-gray-400">SmartProspect add-on</div>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(LEAD_FINDER_COST)}/mo
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900">Total Monthly Cost</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculations.totalMonthlyCost)}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
              <div>Total Annual Cost</div>
              <div className="font-medium">{formatCurrency(calculations.totalAnnualCost)}/yr</div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Prices based on Smartlead.ai, Namecheap, and Premium Inboxes as of Feb 2026.
        </p>
      </div>
    </div>
  );
}
