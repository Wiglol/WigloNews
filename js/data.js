// Pulse & Pattern — local content database (offline-first)
// Edit this file to change the publication’s content. No build step required.

export const SECTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'research', label: 'Research' },
  { id: 'policy', label: 'Policy' },
  { id: 'clinics', label: 'Clinics' },
  { id: 'data', label: 'Data' },
  { id: 'opinion', label: 'Opinion' },
];

const AUTHORS = {
  'maya-kranen': {
    id: 'maya-kranen',
    name: 'Maya Kranen',
    role: 'Health research editor',
    bio: 'Covers clinical AI validation, datasets, and regulation. Background in biomedical informatics.',
  },
  'sami-nurmi': {
    id: 'sami-nurmi',
    name: 'Sami Nurmi',
    role: 'Policy reporter',
    bio: 'Tracks health tech regulation and safety monitoring across the EU and US.',
  },
};

export function getAuthor(id){
  return AUTHORS[id] ?? { id:'unknown', name:'Staff', role:'', bio:'' };
}

const RAW_ARTICLES = [
  {
    id: 'ai-medicine-research',
    section: 'research',
    tags: ['Clinical trials', 'Foundation models', 'Safety'],
    title: 'AI in Medicine Is Leaving the Benchmark Era. Research Has to Catch Up.',
    dek: 'The hardest part is no longer building a model that looks impressive in a paper — it’s proving the model helps real patients, in real workflows, without quietly breaking a month later.',
    authorId: 'maya-kranen',
    published: '2026-02-09',
    updated: '2026-02-09',
    readMinutes: 9,
    image: {
      src: 'assets/img/hero-ai-medicine.jpg',
      alt: 'Two clinicians reviewing an X-ray on a laptop during a clinic consultation.',
      caption: 'Clinical AI begins in workflow — evidence has to match how teams actually read, decide, and follow up.',
    },
    keyNumbers: {
      devices: '1,350+',
      trials: '86+',
      risk: 'High',
    },
    related: ['synthetic-data', 'regulation-watch'],
    blocks: [
      { type: 'p', lead: true, text: 'For a decade, medical AI research has moved in two speeds: fast for algorithms, slow for evidence. The field learned to beat benchmarks, generate crisp heatmaps, and publish leaderboards. Now it’s being asked a harder question: does this help in the real world — at scale — with the guardrails that medicine demands?' },
      { type: 'p', text: 'That question is no longer theoretical. Regulators have authorized a growing number of AI-enabled devices, and hospital systems are steadily deploying tools in radiology, cardiology, and operational triage. But the shift has also exposed a fragile truth: many models are built on retrospective datasets that don’t resemble clinical reality once workflows, scanners, patient populations, and incentives change.' },

      { type: 'h2', text: 'Why the research bottleneck is evidence, not accuracy' },
      { type: 'p', text: 'Accuracy is a starting line. In medicine, what matters is whether a tool changes decisions, improves outcomes, or reduces harm — and whether those benefits persist over time. That requires studies that look more like clinical research than computer vision papers: pre-registered protocols, multi-site evaluation, well-defined endpoints, and transparent reporting of failures.' },
      { type: 'callout', title: 'What counts as “evidence” in clinical AI?', bullets: [
        'External validation: the model holds up on data from other hospitals and devices.',
        'Prospective evaluation: tested in the workflow it’s meant for, not only on historical data.',
        'Clinical endpoints: impact on patient care (or robust proxy outcomes), not just AUROC.',
        'Safety monitoring: post-deployment checks for drift, bias, and unexpected failure modes.',
      ]},

      { type: 'figure', src: 'assets/img/fig-pipeline.png', alt: 'Diagram illustrating a production machine-learning pipeline from data integration to deployment and monitoring.', caption: 'Figure 1 — A production pipeline makes deployment and monitoring part of the research plan.' },

      { type: 'h2', text: 'From retrospective benchmarks to prospective trials' },
      { type: 'p', text: 'Retrospective studies are useful — and often necessary. They let teams explore feasibility, estimate performance, and identify promising use cases. But retrospective performance tends to overstate real-world impact. Labels are cleaner. Cases are pre-selected. The outcome is known. None of that is true at 2 a.m. in an emergency department.' },
      { type: 'p', text: 'A more mature research pattern is emerging: treat the model as a clinical intervention. Run prospective studies (ideally randomized where feasible) that measure how clinicians interact with AI recommendations, whether time-to-decision changes, and how often the system confidently gets something wrong.' },

      { type: 'h2', text: 'Bias and dataset shift are the default, not the edge case' },
      { type: 'p', text: 'A common failure story sounds like this: a model is trained on a carefully curated dataset, validated on a held-out test set, and performs well. Then it gets deployed. Over time, performance degrades — sometimes quietly. The clinic changes its protocol. A new device rolls in. A documentation template updates. Even seasonal shifts can alter case mix.' },
      { type: 'p', text: 'This is dataset shift, and it’s unavoidable. The research task is not to pretend it won’t happen, but to design systems that notice and respond. That means calibration, uncertainty estimates, and monitoring that can flag drift before clinicians lose trust.' },
      { type: 'pullquote', text: 'In medicine, “generalization” is not a property you claim. It’s a property you keep re-checking.' },

      { type: 'h2', text: 'Drug discovery research is speeding up — but it still ends in a lab' },
      { type: 'p', text: 'The most dramatic AI wins in biomedicine have been upstream of the clinic: protein structure prediction and molecular design. AlphaFold reshaped how structural biology approaches unknown proteins, and newer tools aim to predict interactions with other molecules. The effect is real — researchers can explore hypotheses faster — but it doesn’t remove the need for wet-lab validation. It changes which experiments you run first.' },

      { type: 'h2', text: 'Generative models are unusually hard to validate' },
      { type: 'p', text: 'Large language and multi-modal models can read clinical text, summarize notes, draft patient instructions, and answer “what’s the next step?” questions. Research groups are racing to adapt them for medicine, but validation is tricky: the outputs are open-ended, and the failure modes are often plausible-sounding errors.' },
      { type: 'p', text: 'The research playbook that’s emerging: constrain the task (extract medications instead of write a plan), evaluate on realistic notes, require traceable evidence back to source records, and measure workflow impact — time, attention, and decision quality.' },

      {
        type: 'interactive',
        kind: 'research-map',
        title: 'Research map: where clinical AI is being tested right now',
        hint: 'Switch domains to see what researchers measure — and what’s still hard to measure.',
        tabs: [
          {
            id: 'imaging',
            label: 'Imaging',
            kv: [
              { k: 'Typical endpoints', v: 'Diagnostic yield, sensitivity/specificity, time-to-read' },
              { k: 'Common study designs', v: 'Reader studies, prospective triage pilots, RCTs in narrow workflows' },
              { k: 'What breaks in practice', v: 'Different scanners, site protocols, prevalence shifts' },
              { k: 'What “good” looks like', v: 'Multi-site trials + drift monitoring + clear failure reporting' },
            ],
            note: 'Imaging is ahead because tasks are scoped and data is structured — but drift still shows up fast when devices or protocols change.',
          },
          {
            id: 'clinical-notes',
            label: 'Clinical notes',
            kv: [
              { k: 'Typical endpoints', v: 'Charting time, extraction accuracy, clinical documentation quality' },
              { k: 'Common study designs', v: 'Shadow-mode evaluations, human-in-the-loop audits' },
              { k: 'What breaks in practice', v: 'Hallucinated details, missing context, brittle prompting' },
              { k: 'What “good” looks like', v: 'Constrained tasks + evidence links + QA sampling in workflow' },
            ],
            note: 'Text models fail “smoothly”: errors can sound plausible. Research increasingly emphasizes traceability and audit-friendly outputs.',
          },
          {
            id: 'drug-discovery',
            label: 'Drug discovery',
            kv: [
              { k: 'Typical endpoints', v: 'Hit rate, assay success, time-to-candidate, cost per cycle' },
              { k: 'Common study designs', v: 'Benchmark-to-lab loops, prospective design-test cycles' },
              { k: 'What breaks in practice', v: 'Assay mismatch, noisy labels, weak biological transfer' },
              { k: 'What “good” looks like', v: 'Reproducible assays + careful controls + shared negative results' },
            ],
            note: 'AI can accelerate exploration — but the lab remains the arbiter. Better models shift the bottleneck downstream to wet-lab rigor.',
          },
          {
            id: 'post-deployment',
            label: 'Post-deployment',
            kv: [
              { k: 'Typical endpoints', v: 'Drift alerts, calibration stability, error reports, clinician trust' },
              { k: 'Common study designs', v: 'Continuous monitoring, periodic re-validation, incident review' },
              { k: 'What breaks in practice', v: 'Silent performance decay, feedback loops, miscalibration' },
              { k: 'What “good” looks like', v: 'Lifecycle plans: updates, audits, and safety reporting by design' },
            ],
            note: 'The hardest “research” may be ongoing measurement. Mature teams treat monitoring as a clinical quality program.',
          },
        ],
      },

      { type: 'h2', text: 'Regulators are asking for lifecycle thinking' },
      { type: 'p', text: 'As more AI-enabled tools move into patient care, regulators are pushing developers to think beyond premarket metrics. The questions look like quality systems: how was the training data governed, how will updates be handled, and what happens when the model’s behavior changes?' },
      { type: 'p', text: 'In parallel, safety reporting is becoming a bigger part of the story. Adverse event reports can be noisy, but they can surface patterns that don’t show up in premarket studies — especially when software behavior changes after updates.' },

      { type: 'figure', src: 'assets/img/fig-device-landscape.jpg', alt: 'A modern MRI scanner in a clinical imaging suite.', caption: 'Figure 2 — Imaging is where many early medical-AI deployments land: scoped tasks, rich historical data, and clear QA loops.' },

      { type: 'h2', text: 'What would make medical AI research feel “grown up”?' },
      { type: 'p', text: 'The field doesn’t need fewer models. It needs fewer surprises. That suggests a research agenda that rewards: transparent datasets, multi-site trials, clear failure reporting, and monitoring frameworks that can be audited. It also suggests more collaboration with clinical trialists, statisticians, and human factors experts — the people who know how interventions fail in practice.' },
      { type: 'p', text: 'If medical AI succeeds, it won’t be because a model hit 0.99 AUROC on a benchmark. It will be because teams treated evidence as a product: continuously built, continuously checked, and designed around the people who actually use the tools.' },

      { type: 'h2', text: 'Sources and further reading' },
      { type: 'sources', items: [
        { label: 'FDA: Artificial Intelligence-Enabled Medical Devices (list + overview)', href: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices' },
        { label: 'FDA (Jan 6, 2025): Draft guidance for AI-enabled medical devices', href: 'https://www.fda.gov/news-events/press-announcements/fda-issues-comprehensive-draft-guidance-developers-artificial-intelligence-enabled-medical-devices' },
        { label: 'WHO: Ethics and governance of AI for health (LMM guidance)', href: 'https://www.who.int/publications/i/item/9789240084759' },
        { label: 'The Lancet Digital Health (2024): RCTs evaluating AI in clinical practice (scoping review)', href: 'https://www.thelancet.com/journals/landig/article/PIIS2589-7500(24)00047-5/fulltext' },
        { label: 'Nature (2021): Highly accurate protein structure prediction with AlphaFold', href: 'https://www.nature.com/articles/s41586-021-03819-2' },
        { label: 'Reuters (Feb 9, 2026): AI in the operating room and safety reports', href: 'https://www.reuters.com/investigations/ai-enters-operating-room-reports-arise-botched-surgeries-misidentified-body-2026-02-09/' },
      ]},
    ],
  },

  {
    id: 'synthetic-data',
    section: 'data',
    tags: ['Privacy', 'Data quality', 'Fairness'],
    title: 'Synthetic Clinical Data Sounds Like a Shortcut. Researchers Are Treating It Like a New Dataset Type.',
    dek: 'Generated records can reduce some privacy risks — but they can also amplify bias, blur provenance, and hide leakage if you don’t measure the right things.',
    authorId: 'maya-kranen',
    published: '2026-02-05',
    updated: '2026-02-06',
    readMinutes: 6,
    image: {
      src: 'assets/img/thumb-synthetic-data.jpg',
      alt: 'A medical laboratory workstation with a monitor and instrument console.',
      caption: 'Synthetic data can expand test coverage — but it still needs bias audits and provenance you can explain.',
    },
    related: ['ai-medicine-research'],
    blocks: [
      { type: 'p', lead: true, text: 'Synthetic clinical data is getting pitched as a universal solvent: generate a safe dataset, share it freely, and train models without touching patient records. In reality, researchers are discovering a more nuanced story — synthetic data can help, but it behaves like its own dataset type with its own failure modes.' },
      { type: 'h2', text: 'What synthetic data is good for' },
      { type: 'p', text: 'Teams use synthetic data to prototype pipelines, test software, and simulate rare events. It can also support education and benchmarking, especially when generators are calibrated to reproduce broad distributions without revealing individuals.' },
      { type: 'h2', text: 'What researchers worry about' },
      { type: 'ul', items: [
        'Bias transfer: synthetic data inherits the blind spots of the source distribution.',
        'Leakage: generators can memorize fragments of real records if not audited.',
        'Provenance: downstream users may not know what was real, what was generated, and what constraints were applied.',
        'Overconfidence: models trained on “too clean” synthetic data can fail abruptly in messy real notes.',
      ]},
      { type: 'callout', title: 'A practical checklist', bullets: [
        'Run membership-inference style audits (can you detect if a record was in the training set?).',
        'Measure utility on downstream tasks using a real external validation set.',
        'Document generation settings, conditioning variables, and known limitations.',
        'Avoid single-source synthetic releases — include multiple sites when possible.',
      ]},
      { type: 'p', text: 'The bottom line: synthetic data is promising, but only if it’s evaluated with the same rigor we expect from models — and if it comes with documentation that makes it usable without guesswork.' },
    ],
  },

  {
    id: 'regulation-watch',
    section: 'policy',
    tags: ['Regulation', 'Post-market', 'Quality systems'],
    title: 'Regulators Are Signaling a Shift: “AI Features” Need Lifecycle Plans, Not Just Performance Claims.',
    dek: 'Draft guidance and safety reporting are nudging developers toward monitoring, transparency, and update discipline.',
    authorId: 'sami-nurmi',
    published: '2026-01-28',
    updated: '2026-01-28',
    readMinutes: 5,
    image: {
      src: 'assets/img/thumb-policy.jpg',
      alt: 'Hands stamping a document on a desk, suggesting regulation and approval workflows.',
      caption: 'In health tech, “approved once” is becoming “proved continuously.”',
    },
    related: ['ai-medicine-research'],
    blocks: [
      { type: 'p', lead: true, text: 'For years, the regulatory story around medical AI was framed as a bottleneck: approvals are too slow, and innovation is being held back. That narrative is changing. As deployments scale, regulators are emphasizing lifecycle controls — how systems are trained, updated, monitored, and audited after they reach clinics.' },
      { type: 'p', text: 'Recent FDA communications emphasize that many AI-enabled devices have been authorized through existing pathways, but that AI brings unique considerations: data management, performance drift, clarity about what changes when the model updates, and how human factors are addressed.' },
      { type: 'h2', text: 'What “lifecycle” means in practice' },
      { type: 'ul', items: [
        'A clear intended use statement (what the model is for — and what it isn’t).',
        'A plan for updates (and what testing is required before an update ships).',
        'Post-market monitoring signals (how drift, bias, and malfunction reports are detected).',
        'Human factors work (how the UI reduces over-reliance and alert fatigue).',
      ]},
      { type: 'p', text: 'The theme isn’t anti-innovation. It’s pro-evidence: if a tool touches clinical decisions, the evidence needs to keep pace with deployment.' },
    ],
  },
];

export const BRIEFS = [
  {
    id: 'brief-1',
    label: 'In Brief',
    items: [
      { title: 'Hospital pilots are moving from “assist” to “audit”: teams track drift monthly, not annually.', section: 'clinics' },
      { title: 'Researchers publish more “negative results” — failed external validation is becoming publishable.', section: 'research' },
      { title: 'Tooling improves for de-identification audits and membership inference checks.', section: 'data' },
    ],
  }
];

function decorate(raw){
  if(!raw) return null;
  const author = getAuthor(raw.authorId);
  return {
    ...raw,
    author,
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
    related: Array.isArray(raw.related) ? raw.related : [],
    keyNumbers: raw.keyNumbers ?? {},
  };
}

export function getArticle(id){
  return decorate(RAW_ARTICLES.find(a => a.id === id)) ?? null;
}

export function listArticles({ section=null, q='', sort='new' }={}){
  const query = (q ?? '').trim().toLowerCase();
  let items = [...RAW_ARTICLES];

  if(section && section !== 'latest') items = items.filter(a => a.section === section);

  if(query){
    items = items.filter(a => {
      const hay = [a.title, a.dek, (a.tags||[]).join(' '), a.section].join(' ').toLowerCase();
      return hay.includes(query);
    });
  }

  if(sort === 'new'){
    items.sort((a,b) => (b.published.localeCompare(a.published)) || a.title.localeCompare(b.title));
  } else if(sort === 'read'){
    items.sort((a,b) => (b.readMinutes - a.readMinutes) || (b.published.localeCompare(a.published)));
  }

  return items.map(decorate);
}
