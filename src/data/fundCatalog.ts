export interface FundCatalogItem {
  name: string;
  category: string;
  suggestedPurchaseNav: number;
  suggestedCurrentNav: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export const AMC_SCHEMES: Record<string, FundCatalogItem[]> = {
  'SBI Mutual Fund': [
    {
      name: 'SBI Bluechip Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 75.40,
      suggestedCurrentNav: 84.60,
      riskLevel: 'Medium',
      notes: 'Premier large-cap fund investing in top 100 Indian companies for consistent growth.',
    },
    {
      name: 'SBI Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 145.20,
      suggestedCurrentNav: 172.80,
      riskLevel: 'High',
      notes: 'High-conviction portfolio of high-growth emerging small-cap companies.',
    },
    {
      name: 'SBI Magnum Midcap Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 185.50,
      suggestedCurrentNav: 215.30,
      riskLevel: 'High',
      notes: 'Focuses on mid-sized companies with proven business models and expanding market share.',
    },
    {
      name: 'SBI Contra Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 310.00,
      suggestedCurrentNav: 368.50,
      riskLevel: 'High',
      notes: 'Contrarian investment strategy identifying temporarily beaten-down quality stocks.',
    },
    {
      name: 'SBI Long Term Equity Fund (ELSS) - Direct (G)',
      category: 'Equity (ELSS / Tax Saver)',
      suggestedPurchaseNav: 330.20,
      suggestedCurrentNav: 395.40,
      riskLevel: 'High',
      notes: 'Tax-saving mutual fund with 3-year lock-in under Section 80C with long-term compounding.',
    },
    {
      name: 'SBI Focused Equity Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 260.10,
      suggestedCurrentNav: 298.70,
      riskLevel: 'High',
      notes: 'Concentrated high-conviction portfolio of maximum 30 stocks across sectors.',
    },
    {
      name: 'SBI Flexicap Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 92.50,
      suggestedCurrentNav: 108.20,
      riskLevel: 'Medium',
      notes: 'Dynamic multi-cap strategy actively adjusting across large, mid, and small caps.',
    },
    {
      name: 'SBI Nifty 50 Index Fund - Direct Plan (G)',
      category: 'Index Fund (Nifty 50)',
      suggestedPurchaseNav: 205.10,
      suggestedCurrentNav: 236.40,
      riskLevel: 'Medium',
      notes: 'Low-cost passive tracking of Nifty 50 index with minimal tracking error.',
    },
    {
      name: 'SBI Balanced Advantage Fund - Direct (G)',
      category: 'Hybrid / Dynamic Asset',
      suggestedPurchaseNav: 13.80,
      suggestedCurrentNav: 16.20,
      riskLevel: 'Medium',
      notes: 'Dynamic asset allocation between equity and debt based on market valuation models.',
    },
    {
      name: 'SBI Equity Hybrid Fund - Direct Plan (G)',
      category: 'Hybrid / Dynamic Asset',
      suggestedPurchaseNav: 225.40,
      suggestedCurrentNav: 262.80,
      riskLevel: 'Medium',
      notes: 'Aggressive hybrid fund investing 65-80% in equities and balance in fixed income securities.',
    },
    {
      name: 'SBI Healthcare Opportunities Fund - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 290.00,
      suggestedCurrentNav: 345.50,
      riskLevel: 'High',
      notes: 'Thematic investments in pharmaceutical, healthcare, and diagnostic leaders.',
    },
    {
      name: 'SBI Technology Opportunities Fund - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 180.20,
      suggestedCurrentNav: 218.90,
      riskLevel: 'High',
      notes: 'Riding the wave of global digital transformation, software, and AI developments.',
    },
    {
      name: 'SBI Magnum Global Fund - Direct (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 285.30,
      suggestedCurrentNav: 332.10,
      riskLevel: 'High',
      notes: 'Invests predominantly in companies with an MNC pedigree or global presence.',
    },
    {
      name: 'SBI Banking & Financial Services Fund - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 36.50,
      suggestedCurrentNav: 43.10,
      riskLevel: 'High',
      notes: 'Plays the Indian credit growth story across leading private & public banks and NBFCs.',
    },
    {
      name: 'SBI Consumption Opportunities Fund - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 265.00,
      suggestedCurrentNav: 312.40,
      riskLevel: 'High',
      notes: 'Focuses on Indian domestic consumer demand, retail, FMCG, and automotive growth.',
    },
    {
      name: 'SBI Liquid Fund - Direct Plan (G)',
      category: 'Debt / Liquid Fund',
      suggestedPurchaseNav: 3500.00,
      suggestedCurrentNav: 3740.00,
      riskLevel: 'Low',
      notes: 'High liquidity and principal safety with investments in ultra short-term money market instruments.',
    },
  ],

  'HDFC Mutual Fund': [
    {
      name: 'HDFC Top 100 Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 820.00,
      suggestedCurrentNav: 945.50,
      riskLevel: 'Medium',
      notes: 'Consistent large cap compounder focused on market leaders.',
    },
    {
      name: 'HDFC Mid-Cap Opportunities Fund - Direct (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 135.00,
      suggestedCurrentNav: 168.20,
      riskLevel: 'High',
      notes: 'One of the largest and most well-diversified mid-cap funds in India.',
    },
    {
      name: 'HDFC Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 110.50,
      suggestedCurrentNav: 138.40,
      riskLevel: 'High',
      notes: 'Quality small cap businesses with strong return on capital and cash flows.',
    },
    {
      name: 'HDFC Flexi Cap Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 1450.00,
      suggestedCurrentNav: 1720.00,
      riskLevel: 'High',
      notes: 'Flagship fund with proven 25+ year track record across market cycles.',
    },
    {
      name: 'HDFC Balanced Advantage Fund - Direct (G)',
      category: 'Hybrid / Dynamic Asset',
      suggestedPurchaseNav: 380.00,
      suggestedCurrentNav: 442.10,
      riskLevel: 'Medium',
      notes: 'India’s largest hybrid fund combining equity upside with debt safety cushion.',
    },
    {
      name: 'HDFC ELSS Taxsaver - Direct Plan (G)',
      category: 'Equity (ELSS / Tax Saver)',
      suggestedPurchaseNav: 920.00,
      suggestedCurrentNav: 1085.00,
      riskLevel: 'High',
      notes: 'Tax deduction under 80C with diversified equity portfolio.',
    },
    {
      name: 'HDFC Index Fund - Nifty 50 Plan - Direct',
      category: 'Index Fund (Nifty 50)',
      suggestedPurchaseNav: 200.00,
      suggestedCurrentNav: 232.00,
      riskLevel: 'Medium',
      notes: 'Low tracking error passive investment into the Indian benchmark index.',
    },
  ],

  'ICICI Prudential MF': [
    {
      name: 'ICICI Prudential Bluechip Fund - Direct (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 88.00,
      suggestedCurrentNav: 102.50,
      riskLevel: 'Medium',
      notes: 'Disciplined bottom-up stock picking among India’s top bluechips.',
    },
    {
      name: 'ICICI Prudential Bharat Consumption - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 24.50,
      suggestedCurrentNav: 29.80,
      riskLevel: 'High',
      notes: 'Thematic portfolio riding domestic consumer expenditure trends.',
    },
    {
      name: 'ICICI Prudential Value Discovery - Direct (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 320.00,
      suggestedCurrentNav: 385.00,
      riskLevel: 'High',
      notes: 'Value investing legend identifying stocks trading at attractive discounts.',
    },
    {
      name: 'ICICI Prudential Smallcap Fund - Direct (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 70.00,
      suggestedCurrentNav: 89.50,
      riskLevel: 'High',
      notes: 'Rapid earnings growth plays in dynamic emerging small companies.',
    },
    {
      name: 'ICICI Prudential Multi-Asset Fund - Direct (G)',
      category: 'Hybrid / Dynamic Asset',
      suggestedPurchaseNav: 540.00,
      suggestedCurrentNav: 638.00,
      riskLevel: 'Medium',
      notes: 'Allocates across Equity, Debt, and Gold/Commodities for all-weather performance.',
    },
  ],

  'Nippon India Mutual Fund': [
    {
      name: 'Nippon India Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 130.00,
      suggestedCurrentNav: 165.20,
      riskLevel: 'High',
      notes: 'Industry benchmark small-cap powerhouse with massive diversification.',
    },
    {
      name: 'Nippon India Growth Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 3100.00,
      suggestedCurrentNav: 3750.00,
      riskLevel: 'High',
      notes: 'High-growth mid-cap champions with strong competitive moats.',
    },
    {
      name: 'Nippon India Multi Cap Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 215.00,
      suggestedCurrentNav: 260.00,
      riskLevel: 'High',
      notes: 'Mandatory 25% minimum allocation in each large, mid, and small cap bucket.',
    },
    {
      name: 'Nippon India Large Cap Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 72.00,
      suggestedCurrentNav: 84.50,
      riskLevel: 'Medium',
      notes: 'Concentrated exposure in top tier Indian business conglomerates.',
    },
  ],

  'PPFAS Mutual Fund': [
    {
      name: 'Parag Parikh Flexi Cap Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 64.20,
      suggestedCurrentNav: 75.80,
      riskLevel: 'Medium',
      notes: 'Value-oriented global compounding strategy with select overseas equity exposure.',
    },
    {
      name: 'Parag Parikh ELSS Tax Saver Fund - Direct (G)',
      category: 'Equity (ELSS / Tax Saver)',
      suggestedPurchaseNav: 22.10,
      suggestedCurrentNav: 27.50,
      riskLevel: 'High',
      notes: 'Disciplined long-term value strategy with Section 80C tax deduction benefits.',
    },
    {
      name: 'Parag Parikh Conservative Hybrid Fund - Direct (G)',
      category: 'Hybrid / Dynamic Asset',
      suggestedPurchaseNav: 12.80,
      suggestedCurrentNav: 14.50,
      riskLevel: 'Low',
      notes: 'Conservative asset allocation with heavy fixed income and REITs allocation.',
    },
  ],

  'Kotak Mahindra Mutual Fund': [
    {
      name: 'Kotak Emerging Equity Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 102.00,
      suggestedCurrentNav: 124.60,
      riskLevel: 'High',
      notes: 'Top tier midcap fund with consistent alpha generation.',
    },
    {
      name: 'Kotak Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 210.00,
      suggestedCurrentNav: 258.00,
      riskLevel: 'High',
      notes: 'Identifies scalable small business leaders with sound corporate governance.',
    },
    {
      name: 'Kotak Flexicap Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 68.00,
      suggestedCurrentNav: 80.20,
      riskLevel: 'Medium',
      notes: 'Unconstrained equity investing across market capitalizations.',
    },
  ],

  'Axis Mutual Fund': [
    {
      name: 'Axis Bluechip Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 48.00,
      suggestedCurrentNav: 54.50,
      riskLevel: 'Medium',
      notes: 'High quality growth investing in industry titans with robust balance sheets.',
    },
    {
      name: 'Axis Midcap Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 86.00,
      suggestedCurrentNav: 104.20,
      riskLevel: 'High',
      notes: 'Disciplined growth style targeting emerging category leaders.',
    },
    {
      name: 'Axis Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 82.00,
      suggestedCurrentNav: 101.50,
      riskLevel: 'High',
      notes: 'Bottom-up stock selection in high-potential niche market players.',
    },
    {
      name: 'Axis ELSS Tax Saver Fund - Direct Plan (G)',
      category: 'Equity (ELSS / Tax Saver)',
      suggestedPurchaseNav: 85.00,
      suggestedCurrentNav: 99.40,
      riskLevel: 'High',
      notes: 'Long-term wealth creation combined with 80C tax relief.',
    },
  ],

  'Mirae Asset Mutual Fund': [
    {
      name: 'Mirae Asset Large Cap Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 98.00,
      suggestedCurrentNav: 115.60,
      riskLevel: 'Medium',
      notes: 'Growth at reasonable price (GARP) across top 100 Indian companies.',
    },
    {
      name: 'Mirae Asset Midcap Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 32.00,
      suggestedCurrentNav: 41.20,
      riskLevel: 'High',
      notes: 'Focused on mid-sized enterprises with high capital efficiency.',
    },
    {
      name: 'Mirae Asset Great Consumer Fund - Direct (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 82.00,
      suggestedCurrentNav: 98.40,
      riskLevel: 'High',
      notes: 'Benefits from consumer trends, discretionary spending, and urbanization.',
    },
  ],

  'Quant Mutual Fund': [
    {
      name: 'Quant Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 215.00,
      suggestedCurrentNav: 282.00,
      riskLevel: 'High',
      notes: 'Momentum and predictive analytics based dynamic stock rotation.',
    },
    {
      name: 'Quant Active Fund - Direct Plan (G)',
      category: 'Equity (Flexi Cap)',
      suggestedPurchaseNav: 580.00,
      suggestedCurrentNav: 720.00,
      riskLevel: 'High',
      notes: 'Multi-cap dynamic portfolio powered by VLRT analytical framework.',
    },
    {
      name: 'Quant Mid Cap Fund - Direct Plan (G)',
      category: 'Equity (Mid Cap)',
      suggestedPurchaseNav: 185.00,
      suggestedCurrentNav: 240.50,
      riskLevel: 'High',
      notes: 'Data-driven high turnover mid-cap growth compounding.',
    },
  ],

  'UTI Mutual Fund': [
    {
      name: 'UTI Nifty 50 Index Fund - Direct Plan (G)',
      category: 'Index Fund (Nifty 50)',
      suggestedPurchaseNav: 145.00,
      suggestedCurrentNav: 169.50,
      riskLevel: 'Medium',
      notes: 'Industry pioneer index fund with lowest expense ratio and tracking error.',
    },
    {
      name: 'UTI Mastershare Fund - Direct Plan (G)',
      category: 'Equity (Large Cap)',
      suggestedPurchaseNav: 230.00,
      suggestedCurrentNav: 268.00,
      riskLevel: 'Medium',
      notes: 'India’s oldest equity fund with strong dividend track record.',
    },
  ],

  'Tata Mutual Fund': [
    {
      name: 'Tata Digital India Fund - Direct Plan (G)',
      category: 'Sectoral / Thematic',
      suggestedPurchaseNav: 42.00,
      suggestedCurrentNav: 52.80,
      riskLevel: 'High',
      notes: 'Pure-play technology sector fund capturing IT software & cloud services.',
    },
    {
      name: 'Tata Small Cap Fund - Direct Plan (G)',
      category: 'Equity (Small Cap)',
      suggestedPurchaseNav: 35.00,
      suggestedCurrentNav: 45.60,
      riskLevel: 'High',
      notes: 'Focused on emerging business leaders with sustainable competitive edge.',
    },
  ],
};

/**
 * Returns list of schemes for a given AMC. If unknown, returns all schemes matching search query.
 */
export function getSchemesForAmc(amcName: string, query?: string): FundCatalogItem[] {
  let list: FundCatalogItem[] = [];

  if (AMC_SCHEMES[amcName]) {
    list = AMC_SCHEMES[amcName];
  } else {
    // If "Other" or generic, search all known funds
    const all = Object.values(AMC_SCHEMES).flat();
    list = all;
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
    );
  }

  return list;
}
