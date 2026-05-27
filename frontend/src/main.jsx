import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, BarChart3, Bot, BriefcaseBusiness, CheckCircle2, Contact, Database,
  Download, ExternalLink, Eye, FileBadge, Github, GraduationCap, ImagePlus,
  Languages, LayoutDashboard, Linkedin, Mail, MapPin, Menu, Moon, Pencil,
  Plus, Presentation, QrCode, Save, Send, Sparkles, Sun, Trash2, UploadCloud, X
} from 'lucide-react';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, RadialLinearScale,
  PointElement, LineElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import './styles.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

const A = '/portfolio-assets/';
const RESUME_PDF = '/assets/resume/Abhishek_Jatav_Resume.pdf';
const LINKEDIN = 'https://www.linkedin.com/in/abhishek-jatav-ba821b407/';
const GITHUB_USERNAME = 'abhijadav01212-dot';
const GITHUB = `https://github.com/${GITHUB_USERNAME}`;
const RESUME_URL = `${A}resume.png`;
const PROFILE_PHOTO = `${A}profile-final.png`;
const EMAIL = 'it22.abhishekjatav@svceindore.ac.in';

const resume = {
  name: 'Abhishek Jatav',
  role: 'Data Analyst',
  summary: 'Data-driven professional skilled in statistical analysis and knowledgeable with SQL and Python. I leverage expertise in extracting actionable insights from complex datasets, driving informed decision-making and strategic solutions with precision and innovation.',
  education: [
    {
      title: 'B.Tech Information Technology',
      place: 'Swami Vivekanand College of Engineering, Indore M.P.',
      period: '2022 - 2026',
      image: `${A}college.png`,
      map: 'https://www.google.com/maps/search/?api=1&query=Swami+Vivekanand+College+of+Engineering+Indore'
    },
    {
      title: '12th PCM',
      place: 'G.H.S School Pagara, Guna M.P.',
      period: '2021 - 2022',
      image: `${A}school.png`,
      map: 'https://www.google.com/maps/search/?api=1&query=GHS+School+Pagara+Guna+Madhya+Pradesh'
    }
  ],
  experience: [
    'Data Analyst - GRN Bill Analysis (07/2025)',
    'D-Mart silver spring, 452020 Indore'
  ],
  achievements: ['Hackerrank SQL Badge', 'LinkedIn Excel Badge', 'Hackerrank Python Badge'],
  languages: ['Hindi - Native or bilingual proficiency', 'English - Full professional proficiency'],
  interests: ['Technology', 'Stock Market', 'Badminton', 'Novels']
};

const defaultProjects = [
  {
    id: 'inventory-management-system',
    title: 'Inventory Management System',
    tags: ['SQL', 'Database', 'Reporting'],
    images: [{ src: `${A}computer-3d.png`, name: 'Inventory 3D preview' }],
    projectLink: `${GITHUB}/inventory-management-system`,
    githubLink: `${GITHUB}/inventory-management-system`,
    description: 'Designed a relational inventory database with employee, supplier, product, stock, order, and customer tables. Added constraints, triggers, joins, and data cleaning queries for operational reporting.'
  },
  {
    id: 'telangana-growth-analysis',
    title: 'Telangana Growth Analysis',
    tags: ['Power BI', 'DAX', 'Maps'],
    images: [{ src: `${A}developer-3d.png`, name: 'Power BI 3D preview' }],
    projectLink: `${GITHUB}/telangana-growth-analysis`,
    githubLink: `${GITHUB}/telangana-growth-analysis`,
    description: 'Built Power BI analysis with DAX, maps, slicers, transformation, and district-wise trend views for registration, transport, and economic growth insights.'
  },
  {
    id: 'tableau-dashboard',
    title: 'Tableau Dashboard',
    tags: ['Tableau', 'Sales', 'Dashboard'],
    images: [{ src: `${A}web-3d.png`, name: 'Tableau 3D preview' }],
    projectLink: `${GITHUB}/tableau-dashboard`,
    githubLink: `${GITHUB}/tableau-dashboard`,
    description: 'Created interactive Tableau dashboards for orders and sales analysis with region, customer, and category views for fast decision-making.'
  },
  {
    id: 'sales-analysis-excel',
    title: 'Sales Analysis',
    tags: ['Excel', 'Pivot Tables', 'Charts'],
    images: [{ src: `${A}portfolio-3d.png`, name: 'Excel dashboard 3D preview' }],
    projectLink: `${GITHUB}/sales-analysis-excel`,
    githubLink: `${GITHUB}/sales-analysis-excel`,
    description: 'Implemented Excel data cleaning, pivot analysis, formulas, dashboard charts, and trend summaries from multi-sheet sales data.'
  }
];

const certificates = [
  { title: 'SQL Course', issuer: 'Self Learning', date: '02/05/2026', image: '/assets/certificates/SQL_Course_Certificate.png', link: 'https://www.skillcourse.in/verify/SC-5C38B49355' },
  { title: 'Microsoft Excel', issuer: 'Self Learning', date: '02/05/2026', image: '/assets/certificates/Microsoft_Excel_Certificate.png', link: 'https://www.skillcourse.in/verify/SC-9D17BC686B' },
  { title: 'Microsoft Power BI', issuer: 'Self Learning', date: '09/03/2026', image: '/assets/certificates/Microsoft_Power_BI_Certificate.png', link: 'https://www.skillcourse.in/verify/SC-9F136D81F3' },
  { title: 'Tableau', issuer: 'Self Learning', date: '02/05/2026', image: '/assets/certificates/Tableau_Certificate.png', link: 'https://www.skillcourse.in/verify/tableau-abhishek-jatav' }
];

const technicalSkills = [
  ['Python', 86], ['SQL', 91], ['Power BI', 88], ['Tableau', 82], ['Advanced Excel', 90],
  ['Pandas', 84], ['NumPy', 80], ['Statistics', 78], ['AWS QuickSight', 72]
];

const communicationSkills = [
  ['Teamwork', 90], ['Leadership', 82], ['Problem Solving', 92], ['Communication', 88], ['Presentation Skills', 84]
];

function qrUrl(value, size = 170) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
}

function App() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [projects, setProjects] = useLocalJsonDatabase('abhishek-projects-json', defaultProjects);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.title = 'Abhishek Portfolio | Abhishek Jatav Data Analyst Dashboard';
    upsertMeta('description', 'Abhishek Portfolio is a professional AI-powered portfolio and dashboard website for Abhishek Jatav, Data Analyst.');
    upsertMeta('keywords', 'Abhishek Portfolio, Abhishek Jatav, Data Analyst, Power BI, SQL, Tableau, Excel, Dashboard');
  }, [dark]);

  useEffect(() => {
    const openResume = () => setModal({
      type: 'resume',
      title: 'Abhishek Jatav Resume',
      issuer: 'Professional Data Analyst Resume',
      date: 'PDF',
      image: RESUME_URL,
      pdf: RESUME_PDF,
      link: RESUME_PDF
    });
    window.addEventListener('open-resume-preview', openResume);
    return () => window.removeEventListener('open-resume-preview', openResume);
  }, []);

  return (
    <div className="app-shell">
      <ParticleField />
      <AnimatePresence>{toast && <Toast message={toast} />}</AnimatePresence>
      <Header dark={dark} setDark={setDark} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
      <main>
        <Hero notify={notify} />
        <ResumeDashboard />
        <EducationDashboard notify={notify} />
        <ProjectDashboard projects={projects} setProjects={setProjects} notify={notify} setModal={setModal} />
        <CertificateDashboard setModal={setModal} notify={notify} />
        <SkillsDashboard />
        <CommunicationDashboard />
        <AdminDashboard projects={projects} setProjects={setProjects} notify={notify} />
        <ContactSection notify={notify} />
      </main>
      <ChatBot />
      <Footer />
      <AnimatePresence>{modal && <PreviewModal item={modal} close={() => setModal(null)} />}</AnimatePresence>
    </div>
  );
}

function Header({ dark, setDark, menuOpen, setMenuOpen }) {
  const links = ['home', 'resume', 'education', 'projects', 'certificates', 'skills', 'admin', 'contact'];
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Abhishek Jatav home">
        <img className="nav-avatar" src={PROFILE_PHOTO} alt="Abhishek Jatav" />
        <span><strong>Abhishek Portfolio</strong><small>Data dashboard OS</small></span>
      </a>
      <nav className="desktop-nav">
        {links.map((link) => <a key={link} href={`#${link}`}>{link}</a>)}
      </nav>
      <div className="top-actions">
        <button className="icon-button" type="button" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen(!menuOpen)} title="Open menu"><Menu size={18} /></button>
      </div>
    </header>
  );
}

function MobileMenu({ open, close }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.nav className="mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          {['home', 'resume', 'education', 'projects', 'certificates', 'skills', 'admin', 'contact'].map((link) => (
            <a key={link} href={`#${link}`} onClick={close}>{link}</a>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

function Hero({ notify }) {
  return (
    <section id="home" className="hero-section">
      <div className="hero-copy">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><Sparkles size={16} /> Abhishek Portfolio</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
          Abhishek Jatav
          <span className="typing">Data Analyst</span>
        </motion.h1>
        <motion.p className="hero-lead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}>{resume.summary}</motion.p>
        <div className="hero-actions">
          <button className="primary-btn" type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-resume-preview'))}><Eye size={18} /> Preview Resume</button>
          <a className="secondary-btn" href={RESUME_PDF} download="Abhishek_Jatav_Resume.pdf"><Download size={18} /> Download Resume</a>
          <a className="secondary-btn" href="#contact"><Contact size={18} /> Contact</a>
          <a className="icon-button social linkedin-link" href={LINKEDIN} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin size={19} /></a>
          <a className="icon-button social" href={GITHUB} target="_blank" rel="noreferrer" title="GitHub"><Github size={19} /></a>
          <button className="icon-button social" type="button" onClick={() => notify('LinkedIn QR is ready to scan')} title="LinkedIn QR"><QrCode size={19} /></button>
        </div>
        <div className="hero-stats">
          <Counter label="Projects" value={4} suffix="+" />
          <Counter label="Certificates" value={4} suffix="+" />
          <Counter label="Skills" value={9} suffix="+" />
        </div>
      </div>
      <motion.div className="hero-board" initial={{ opacity: 0, rotateX: 8, y: 24 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ delay: .12 }}>
        <div className="profile-card tilt-card">
          <div className="profile-photo-wrap">
            <img className="profile-photo" src={PROFILE_PHOTO} alt="Abhishek Jatav profile" />
          </div>
          <div>
            <p className="micro-label">Abhishek Portfolio dashboard</p>
            <h2>Data intelligence, dashboards, and clean decision systems.</h2>
          </div>
          <div className="qr-tile">
            <img src={qrUrl(LINKEDIN, 140)} alt="LinkedIn QR code" />
            <span>LinkedIn QR</span>
          </div>
        </div>
        <div className="floating-stack">
          <img src={`${A}abhishek-name.png`} alt="Abhishek name visual" />
          <img src={`${A}working-computer.gif`} alt="Working on computer animation" />
        </div>
      </motion.div>
    </section>
  );
}

function ResumeDashboard() {
  return (
    <section id="resume" className="section">
      <SectionTitle icon={LayoutDashboard} kicker="Resume cockpit" title="Complete Professional Dashboard" body="All resume details are organized as clean, scannable dashboard cards." />
      <div className="resume-grid">
        <GlassCard className="about-card">
          <h3>About Me</h3>
          <p>{resume.summary}</p>
          <div className="contact-pills">
            <span>{EMAIL}</span><span>Indore, Madhya Pradesh</span>
          </div>
        </GlassCard>
        <DataCard icon={Award} title="Achievements" items={resume.achievements} />
        <DataCard icon={BriefcaseBusiness} title="Experience" items={resume.experience} />
        <DataCard icon={Languages} title="Languages" items={resume.languages} />
        <DataCard icon={Sparkles} title="Interests" items={resume.interests} />
        <GlassCard>
          <h3>Technical Skills</h3>
          <div className="skill-chip-wrap">{technicalSkills.map(([name]) => <span key={name} className="skill-chip">{name}</span>)}</div>
        </GlassCard>
      </div>
    </section>
  );
}

function EducationDashboard({ notify }) {
  return (
    <section id="education" className="section soft-band">
      <SectionTitle icon={GraduationCap} kicker="Education map" title="College & School Dashboard" body="Animated 3D cards with image upload, Google Maps links, and QR codes for location sharing." />
      <div className="education-grid">
        {resume.education.map((item) => <EducationCard key={item.title} item={item} notify={notify} />)}
      </div>
    </section>
  );
}

function EducationCard({ item, notify }) {
  const [uploads, setUploads] = usePersistentImages(`edu-${item.title}`);
  const image = uploads[0]?.src || item.image;
  return (
    <motion.article className="education-card tilt-card" whileHover={{ rotateX: 2, rotateY: -3, y: -8 }}>
      <img className="wide-image" src={image} alt={item.place} />
      <div className="card-body">
        <p className="micro-label">{item.period}</p>
        <h3>{item.title}</h3>
        <p>{item.place}</p>
        <AssetControls
          label="Update institution image"
          current={uploads}
          fallback={item.image}
          onImages={(files) => { setUploads(files); notify('Education image preview updated'); }}
          onDelete={() => { setUploads([]); notify('Education image reset to permanent asset'); }}
        />
        <div className="split-actions">
          <a className="secondary-btn" href={item.map} target="_blank" rel="noreferrer"><MapPin size={17} /> Map</a>
          <a className="secondary-btn" href={qrUrl(item.map, 500)} download><QrCode size={17} /> QR</a>
        </div>
        <img className="mini-qr" src={qrUrl(item.map)} alt={`${item.place} QR code`} />
      </div>
    </motion.article>
  );
}

function ProjectDashboard({ projects, setProjects, notify, setModal }) {
  const updateProject = (updatedProject) => {
    setProjects(projects.map((project) => project.id === updatedProject.id ? updatedProject : project));
    notify(`${updatedProject.title} project updated`);
  };
  const deleteProject = (projectId) => {
    const target = projects.find((project) => project.id === projectId);
    setProjects(projects.filter((project) => project.id !== projectId));
    notify(`${target?.title || 'Project'} deleted`);
  };
  return (
    <section id="projects" className="section">
      <SectionTitle icon={Database} kicker="Project command center" title="Analytics Project Dashboard" body="Every project supports multiple PNG uploads, gallery previews, QR generation, and animated dashboard cards." />
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            notify={notify}
            onUpdate={updateProject}
            onDelete={deleteProject}
            setModal={setModal}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, notify, onUpdate, onDelete, setModal }) {
  const gallery = normalizeProjectImages(project);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (gallery.length < 2) return undefined;
    const id = window.setInterval(() => setActive((index) => (index + 1) % gallery.length), 2600);
    return () => window.clearInterval(id);
  }, [gallery.length]);
  const addImages = (files) => {
    onUpdate({ ...project, images: [...gallery, ...files] });
    setActive(0);
  };
  const replaceImages = (files) => {
    onUpdate({ ...project, images: files.length ? files : gallery });
    setActive(0);
  };
  const projectUrl = project.projectLink || project.githubLink || GITHUB;
  const tags = normalizeTags(project.tags || project.stack);
  return (
    <motion.article className="project-card tilt-card" whileHover={{ y: -8, rotateX: 2 }}>
      <div className="gallery-shell">
        <img src={gallery[active % gallery.length].src} alt={`${project.title} dashboard preview`} />
        <div className="gallery-dots">{gallery.map((_, i) => <button key={i} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Open preview ${i + 1}`} />)}</div>
      </div>
      <div className="card-body">
        <div className="card-heading">
          <div><p className="micro-label">{tags.join(' / ')}</p><h3>{project.title}</h3></div>
          <span className="qr-scan"><img className="mini-qr" src={qrUrl(projectUrl, 120)} alt={`${project.title} QR`} /></span>
        </div>
        <p>{project.description}</p>
        <div className="tag-row">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <AssetControls
          label="Replace project PNG gallery"
          multiple
          current={gallery}
          fallback={gallery[0]?.src}
          onImages={replaceImages}
          onDelete={() => { onUpdate({ ...project, images: normalizeProjectImages(defaultProjects.find((item) => item.id === project.id) || project) }); notify(`${project.title} gallery reset`); }}
        />
        <UploadZone label="Upload more project PNG images" multiple onImages={addImages} />
        <div className="split-actions">
          <a className="primary-btn" href={projectUrl} target="_blank" rel="noreferrer">View Project <ExternalLink size={17} /></a>
          <a className="secondary-btn" href={project.githubLink || GITHUB} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a>
          <button className="secondary-btn" type="button" onClick={() => setModal({ type: 'project-gallery', title: project.title, issuer: 'Project Gallery', date: `${gallery.length} image${gallery.length === 1 ? '' : 's'}`, images: gallery, image: gallery[active % gallery.length].src, link: projectUrl })}><Eye size={17} /> Gallery</button>
          <a className="secondary-btn" href={qrUrl(projectUrl, 600)} download><QrCode size={17} /> QR</a>
          <button className="mini-action" type="button" onClick={() => window.dispatchEvent(new CustomEvent('edit-project', { detail: project.id }))}><Pencil size={15} /> Edit</button>
          <button className="mini-action danger" type="button" onClick={() => onDelete(project.id)}><Trash2 size={15} /> Delete</button>
        </div>
      </div>
    </motion.article>
  );
}

function CertificateDashboard({ setModal, notify }) {
  const [extraCertificates, setExtraCertificates] = usePersistentImages('extra-certificates');
  const addCertificates = (files) => {
    const enriched = files.map((file, index) => ({
      ...file,
      id: `${Date.now()}-${index}`,
      title: file.name?.replace(/\.[^.]+$/, '') || `Certificate ${extraCertificates.length + index + 1}`,
      issuer: 'Uploaded Certificate',
      date: 'Local Storage',
      link: LINKEDIN
    }));
    setExtraCertificates([...extraCertificates, ...enriched]);
    notify(`${files.length} certificate${files.length === 1 ? '' : 's'} added`);
  };
  const updateExtra = (id, files) => {
    const [file] = files;
    if (!file) return;
    setExtraCertificates(extraCertificates.map((certificate) => (certificate.id || certificate.src) === id ? {
      ...certificate,
      src: file.src,
      name: file.name,
      title: file.name?.replace(/\.[^.]+$/, '') || certificate.title
    } : certificate));
    notify('Certificate updated');
  };
  const deleteExtra = (id) => {
    setExtraCertificates(extraCertificates.filter((certificate) => (certificate.id || certificate.src) !== id));
    notify('Certificate deleted');
  };

  return (
    <section id="certificates" className="section soft-band">
      <SectionTitle icon={FileBadge} kicker="Certificate dashboard" title="Permanent Certificate Management" body="Certificates are loaded from permanent project assets, with preview, download, QR verification, update, delete, and multi-certificate add controls." />
      <GlassCard className="certificate-add-panel">
        <div>
          <h3>Add Multiple Certificates</h3>
          <p>Upload PNG, JPG, or GIF certificate files. They are saved in browser local storage and loaded automatically on the next visit.</p>
        </div>
        <UploadZone label="Add certificate images" multiple onImages={addCertificates} />
      </GlassCard>
      <div className="certificate-grid">
        {certificates.map((certificate) => <CertificateCard key={certificate.title} certificate={certificate} setModal={setModal} notify={notify} />)}
        {extraCertificates.map((certificate) => {
          const certificateId = certificate.id || certificate.src;
          return (
          <UploadedCertificateCard
            key={certificateId}
            certificate={certificate}
            setModal={setModal}
            onUpdate={(files) => updateExtra(certificateId, files)}
            onDelete={() => deleteExtra(certificateId)}
          />
        );})}
      </div>
    </section>
  );
}

function CertificateCard({ certificate, setModal, notify }) {
  const [uploads, setUploads] = usePersistentImages(`cert-${certificate.title}`);
  const image = uploads[0]?.src || certificate.image;
  const item = { ...certificate, image };
  return (
    <motion.article className="certificate-card tilt-card" whileHover={{ y: -8, rotateY: 3 }}>
      <img src={image} alt={`${certificate.title} certificate preview`} />
      <div className="card-body">
        <p className="micro-label">{certificate.issuer} - {certificate.date}</p>
        <h3>{certificate.title}</h3>
        <AssetControls
          label="Update certificate image"
          current={uploads}
          fallback={certificate.image}
          onImages={(files) => { setUploads(files); notify('Certificate preview updated'); }}
          onDelete={() => { setUploads([]); notify('Certificate reset to permanent stored image'); }}
        />
        <div className="split-actions">
          <button className="primary-btn" type="button" onClick={() => setModal(item)}>Preview</button>
          <a className="secondary-btn" href={image} download><Download size={17} /> Download</a>
        </div>
        <span className="qr-scan"><img className="mini-qr" src={qrUrl(certificate.link)} alt={`${certificate.title} verification QR`} /></span>
      </div>
    </motion.article>
  );
}

function UploadedCertificateCard({ certificate, setModal, onUpdate, onDelete }) {
  const item = {
    title: certificate.title,
    issuer: certificate.issuer,
    date: certificate.date,
    image: certificate.src,
    link: certificate.link || LINKEDIN
  };
  return (
    <motion.article className="certificate-card tilt-card" whileHover={{ y: -8, rotateY: 3 }}>
      <img src={certificate.src} alt={`${certificate.title} certificate preview`} />
      <div className="card-body">
        <p className="micro-label">{certificate.issuer} - {certificate.date}</p>
        <h3>{certificate.title}</h3>
        <AssetControls
          label="Update uploaded certificate"
          current={[certificate]}
          fallback={certificate.src}
          onImages={onUpdate}
          onDelete={onDelete}
        />
        <div className="split-actions">
          <button className="primary-btn" type="button" onClick={() => setModal(item)}>Preview</button>
          <a className="secondary-btn" href={certificate.src} download={certificate.name || certificate.title}><Download size={17} /> Download</a>
        </div>
        <span className="qr-scan"><img className="mini-qr" src={qrUrl(item.link)} alt={`${certificate.title} verification QR`} /></span>
      </div>
    </motion.article>
  );
}

function SkillsDashboard() {
  const skillChart = useMemo(() => ({
    labels: technicalSkills.map(([name]) => name),
    datasets: [{ label: 'Skill strength', data: technicalSkills.map(([, value]) => value), backgroundColor: '#1fb6ff', borderRadius: 8 }]
  }), []);
  const radarChart = useMemo(() => ({
    labels: communicationSkills.map(([name]) => name),
    datasets: [{ label: 'Communication skills', data: communicationSkills.map(([, value]) => value), backgroundColor: 'rgba(20, 184, 166, .18)', borderColor: '#14b8a6', pointBackgroundColor: '#111827' }]
  }), []);
  return (
    <section id="skills" className="section">
      <SectionTitle icon={BarChart3} kicker="Skill intelligence" title="Interactive Skills Dashboard" body="Animated progress bars, circular graphs, and chart-based capability views." />
      <div className="skills-layout">
        <GlassCard>
          <h3>Technical Progress</h3>
          <div className="progress-list">{technicalSkills.map(([name, value]) => <Progress key={name} name={name} value={value} />)}</div>
        </GlassCard>
        <GlassCard>
          <h3>Circular Skill Graphs</h3>
          <div className="circle-grid">{technicalSkills.slice(0, 6).map(([name, value]) => <CircleSkill key={name} name={name} value={value} />)}</div>
        </GlassCard>
        <GlassCard className="chart-card"><h3>Analytics Stack</h3><Bar data={skillChart} options={chartOptions(false)} /></GlassCard>
        <GlassCard className="chart-card"><h3>Communication Radar</h3><Radar data={radarChart} options={chartOptions(true)} /></GlassCard>
      </div>
    </section>
  );
}

function CommunicationDashboard() {
  const data = {
    labels: communicationSkills.map(([name]) => name),
    datasets: [{ data: communicationSkills.map(([, value]) => value), backgroundColor: ['#1fb6ff', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444'] }]
  };
  return (
    <section className="section soft-band">
      <SectionTitle icon={Presentation} kicker="Soft-skill operations" title="Communication Skills Dashboard" body="Teamwork, leadership, problem solving, communication, and presentation skills visualized for hiring teams." />
      <div className="communication-layout">
        <GlassCard className="chart-card"><Doughnut data={data} options={chartOptions(false)} /></GlassCard>
        <div className="comm-grid">
          {communicationSkills.map(([name, value]) => (
            <GlassCard key={name} className="comm-card">
              <CheckCircle2 /><strong>{name}</strong><span>{value}%</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminDashboard({ projects, setProjects, notify }) {
  const [uploads, setUploads] = usePersistentImages('admin-gallery');
  const [link, setLink] = useState(LINKEDIN);
  return (
    <section id="admin" className="section">
      <SectionTitle icon={UploadCloud} kicker="Admin dashboard" title="Upload, Preview, QR & Local Storage System" body="A working local admin console for PNG uploads, drag and drop previews, gallery management, download actions, and QR generation." />
      <div className="admin-layout">
        <GlassCard>
          <div className="admin-profile-strip">
            <img className="profile-avatar-sm" src={PROFILE_PHOTO} alt="Abhishek Jatav admin profile" />
            <div>
              <p className="micro-label">Admin profile</p>
              <h3>Abhishek Jatav</h3>
            </div>
          </div>
          <h3>Dashboard Upload Manager</h3>
          <AssetControls
            label="Update dashboard PNG/JPG images"
            multiple
            current={uploads}
            fallback={`${A}gif-pic.gif`}
            onImages={(files) => { setUploads(files); notify('Admin gallery saved locally'); }}
            onDelete={() => { setUploads([]); notify('Admin gallery reset to default visuals'); }}
          />
          <label className="field-label">QR link generator<input value={link} onChange={(e) => setLink(e.target.value)} /></label>
          <div className="qr-row"><img src={qrUrl(link)} alt="Generated QR" /><span>Auto-generated QR code for the current link.</span></div>
        </GlassCard>
        <GlassCard className="gallery-manager">
          <h3>Auto Image Preview</h3>
          <div className="upload-gallery">
            {(uploads.length ? uploads : [{ src: `${A}gif-pic.gif`, name: 'AI dashboard visual' }, { src: `${A}resume-illustration.png`, name: 'Resume visual' }]).map((image) => (
              <a key={image.src} href={image.src} download={image.name} className="gallery-item">
                <img src={image.src} alt={image.name} /><span><Download size={15} /> {image.name}</span>
              </a>
            ))}
          </div>
        </GlassCard>
      </div>
      <ProjectManager projects={projects} setProjects={setProjects} notify={notify} />
    </section>
  );
}

function ProjectManager({ projects, setProjects, notify }) {
  const emptyForm = {
    id: '',
    title: '',
    description: '',
    projectLink: '',
    githubLink: GITHUB,
    tags: '',
    images: []
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');

  useEffect(() => {
    const editFromCard = (event) => {
      const target = projects.find((project) => project.id === event.detail);
      if (!target) return;
      setEditingId(target.id);
      setForm({
        ...target,
        tags: normalizeTags(target.tags).join(', '),
        images: normalizeProjectImages(target)
      });
      document.getElementById('project-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('edit-project', editFromCard);
    return () => window.removeEventListener('edit-project', editFromCard);
  }, [projects]);

  const resetForm = () => {
    setEditingId('');
    setForm(emptyForm);
  };

  const submitProject = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    const id = editingId || slugify(title);
    const nextProject = {
      id,
      title,
      description: form.description.trim(),
      projectLink: form.projectLink.trim() || form.githubLink.trim() || GITHUB,
      githubLink: form.githubLink.trim() || GITHUB,
      tags: normalizeTags(form.tags),
      images: form.images.length ? form.images : [{ src: `${A}portfolio-3d.png`, name: `${title} preview` }]
    };
    setProjects(editingId ? projects.map((project) => project.id === editingId ? nextProject : project) : [nextProject, ...projects]);
    notify(editingId ? 'Project updated in local JSON database' : 'New project added to portfolio');
    resetForm();
  };

  const loadProject = (project) => {
    setEditingId(project.id);
    setForm({ ...project, tags: normalizeTags(project.tags).join(', '), images: normalizeProjectImages(project) });
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter((project) => project.id !== projectId));
    if (editingId === projectId) resetForm();
    notify('Project deleted from local JSON database');
  };

  const addImages = (files) => setForm({ ...form, images: [...form.images, ...files] });

  return (
    <GlassCard className="project-manager" id="project-manager">
      <div className="manager-head">
        <div>
          <p className="micro-label">Local JSON project database</p>
          <h3>{editingId ? 'Edit Project' : 'Add New Project'}</h3>
        </div>
        <button className="primary-btn" type="button" onClick={resetForm}><Plus size={17} /> Add New Project</button>
      </div>
      <form className="project-form" onSubmit={submitProject}>
        <label className="field-label">Project title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label className="field-label">Project link<input value={form.projectLink} onChange={(e) => setForm({ ...form, projectLink: e.target.value })} placeholder="https://..." /></label>
        <label className="field-label">GitHub link<input value={form.githubLink} onChange={(e) => setForm({ ...form, githubLink: e.target.value })} placeholder={GITHUB} /></label>
        <label className="field-label">Technology tags<input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="SQL, Power BI, Excel" /></label>
        <label className="field-label form-wide">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <div className="form-wide">
          <UploadZone label="Upload multiple PNG project images" multiple onImages={addImages} />
          <div className="manager-preview">
            {form.images.map((image, index) => (
              <button key={`${image.src}-${index}`} type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })} title="Remove image">
                <img src={image.src} alt={image.name || `Project upload ${index + 1}`} />
                <X size={15} />
              </button>
            ))}
          </div>
        </div>
        <div className="form-wide split-actions">
          <button className="primary-btn" type="submit"><Save size={17} /> {editingId ? 'Save Project' : 'Add Project'}</button>
          <button className="secondary-btn" type="button" onClick={resetForm}>Clear</button>
        </div>
      </form>
      <div className="project-table">
        {projects.map((project) => (
          <div key={project.id} className="project-row">
            <img src={normalizeProjectImages(project)[0]?.src} alt={project.title} />
            <div><strong>{project.title}</strong><span>{normalizeTags(project.tags).join(', ')}</span></div>
            <button className="mini-action" type="button" onClick={() => loadProject(project)}><Pencil size={15} /> Edit</button>
            <button className="mini-action danger" type="button" onClick={() => deleteProject(project.id)}><Trash2 size={15} /> Delete</button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ContactSection({ notify }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const submit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || 'Visitor'}`);
    const body = encodeURIComponent(`${form.message}\n\nReply to: ${form.email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    notify('Opening email app for contact message');
  };
  return (
    <section id="contact" className="section contact-section">
      <SectionTitle icon={Mail} kicker="Contact center" title="Let's Build with Data" body="Contact form, LinkedIn integration, email, GitHub, and QR access in one polished dashboard." />
      <div className="contact-layout">
        <form className="contact-form glass-card" onSubmit={submit}>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Your email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <button className="primary-btn" type="submit"><Send size={18} /> Send Email</button>
        </form>
        <GlassCard className="contact-visual">
          <img className="contact-profile-photo" src={PROFILE_PHOTO} alt="Abhishek Jatav contact profile" />
          <div className="contact-links">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a className="linkedin-text-link" href={LINKEDIN} target="_blank" rel="noreferrer">LinkedIn profile</a>
            <a href={GITHUB} target="_blank" rel="noreferrer">GitHub: {GITHUB_USERNAME}</a>
          </div>
          <img className="contact-qr" src={qrUrl(LINKEDIN, 180)} alt="LinkedIn QR" />
        </GlassCard>
        <GlassCard className="linkedin-preview-card">
          <img className="profile-avatar-lg" src={PROFILE_PHOTO} alt="Abhishek Jatav LinkedIn preview" />
          <div>
            <p className="micro-label">LinkedIn preview</p>
            <h3>Abhishek Jatav</h3>
            <p>Data Analyst | SQL | Power BI | Tableau | Excel</p>
            <a className="secondary-btn" href={LINKEDIN} target="_blank" rel="noreferrer"><Linkedin size={17} /> Open LinkedIn</a>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ who: 'ai', text: 'Hi, I am Abhishek portfolio assistant. Ask me about skills, projects, certificates, or contact details.' }]);
  const [text, setText] = useState('');
  const reply = (value) => {
    const v = value.toLowerCase();
    if (v.includes('project')) return 'Abhishek has built SQL inventory, Power BI Telangana growth, Tableau sales, and Excel sales-analysis dashboards.';
    if (v.includes('skill')) return 'Core skills include SQL, Python, Power BI, Tableau, Advanced Excel, Pandas, NumPy, Statistics, and AWS QuickSight.';
    if (v.includes('certificate')) return 'Certificates include SQL Course, Microsoft Excel, Microsoft Power BI, and Tableau.';
    if (v.includes('contact')) return `Email ${EMAIL}. LinkedIn and GitHub QR access is available in the hero and contact sections.`;
    return 'This portfolio highlights Abhishek Jatav as a Data Analyst with dashboarding, SQL, BI, and analytics strengths.';
  };
  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setMessages((old) => [...old, { who: 'you', text }, { who: 'ai', text: reply(text) }]);
    setText('');
  };
  return (
    <div className="chatbot">
      <AnimatePresence>
        {open && (
          <motion.div className="chat-window" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}>
            <div className="chat-head"><strong>AI Assistant</strong><button onClick={() => setOpen(false)}><X size={17} /></button></div>
            <div className="chat-body">{messages.map((m, i) => <p key={i} className={m.who}>{m.text}</p>)}</div>
            <form onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about portfolio..." /><button><Send size={16} /></button></form>
          </motion.div>
        )}
      </AnimatePresence>
      <button className="chat-toggle" type="button" onClick={() => setOpen(!open)}><Bot size={22} /></button>
    </div>
  );
}

function AssetControls({ label, multiple = false, current = [], fallback, onImages, onDelete }) {
  const inputRef = useRef(null);
  const activeAsset = current[0]?.src || fallback;
  const hasCustom = current.length > 0;
  return (
    <div className="asset-controls">
      <UploadZone label={label} multiple={multiple} onImages={onImages} inputRef={inputRef} />
      <div className="asset-action-row">
        <a className="mini-action" href={activeAsset} download><Download size={15} /> Download</a>
        <button className="mini-action" type="button" onClick={() => inputRef.current?.click()}><Pencil size={15} /> Update</button>
        <button className="mini-action danger" type="button" onClick={onDelete} disabled={!hasCustom}><Trash2 size={15} /> Delete</button>
      </div>
    </div>
  );
}

function UploadZone({ label, multiple = false, onImages, inputRef }) {
  const [drag, setDrag] = useState(false);
  const handleFiles = async (fileList) => {
    const files = [...fileList].filter((file) => file.type.startsWith('image/'));
    const images = await Promise.all(files.map(fileToData));
    onImages(images);
  };
  return (
    <label
      className={`upload-zone ${drag ? 'dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      <ImagePlus size={18} /><span>{label}</span>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/gif" multiple={multiple} onChange={(e) => handleFiles(e.target.files)} />
    </label>
  );
}

function usePersistentImages(key) {
  const [images, setImagesState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  });
  const setImages = (next) => {
    setImagesState(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* large uploads may exceed browser quota */ }
  };
  return [images, setImages];
}

function useLocalJsonDatabase(key, initialRows) {
  const [rows, setRowsState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      return Array.isArray(saved) && saved.length ? saved.map(normalizeProjectRecord) : initialRows;
    } catch {
      return initialRows;
    }
  });
  const setRows = (nextRows) => {
    const cleanRows = nextRows.map(normalizeProjectRecord);
    setRowsState(cleanRows);
    try { localStorage.setItem(key, JSON.stringify(cleanRows)); } catch { /* large image uploads may exceed browser quota */ }
  };
  return [rows, setRows];
}

function normalizeProjectRecord(project) {
  return {
    id: project.id || slugify(project.title || 'project'),
    title: project.title || 'Untitled Project',
    description: project.description || '',
    tags: normalizeTags(project.tags || project.stack),
    images: normalizeProjectImages(project),
    projectLink: project.projectLink || project.link || project.githubLink || GITHUB,
    githubLink: project.githubLink || project.link || GITHUB
  };
}

function normalizeProjectImages(project) {
  if (Array.isArray(project.images) && project.images.length) return project.images;
  if (project.image) return [{ src: project.image, name: project.title || 'Project image' }];
  return [{ src: `${A}portfolio-3d.png`, name: project.title || 'Project preview' }];
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  return String(tags || 'Analytics').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
}

function fileToData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, name: file.name });
    reader.readAsDataURL(file);
  });
}

function SectionTitle({ icon: Icon, kicker, title, body }) {
  return (
    <div className="section-title">
      <p className="eyebrow"><Icon size={16} /> {kicker}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function GlassCard({ children, className = '' }) {
  return <motion.div className={`glass-card ${className}`} whileHover={{ y: -5 }}>{children}</motion.div>;
}

function DataCard({ icon: Icon, title, items }) {
  return (
    <GlassCard>
      <div className="data-card-title"><Icon size={20} /><h3>{title}</h3></div>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </GlassCard>
  );
}

function Progress({ name, value }) {
  return (
    <div className="progress-row">
      <span>{name}</span><strong>{value}%</strong>
      <div><motion.i initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: .8 }} /></div>
    </div>
  );
}

function CircleSkill({ name, value }) {
  return (
    <div className="circle-skill" style={{ '--value': `${value * 3.6}deg` }}>
      <div><strong>{value}%</strong></div><span>{name}</span>
    </div>
  );
}

function Counter({ label, value, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setCount((x) => Math.min(value, x + 1)), 70);
    return () => window.clearInterval(id);
  }, [value]);
  return <div><strong>{count}{suffix}</strong><span>{label}</span></div>;
}

function PreviewModal({ item, close }) {
  const galleryImages = item.type === 'project-gallery' ? (item.images || [item]) : null;
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="preview-modal" initial={{ scale: .96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, y: 20 }}>
        <button className="modal-close" onClick={close}><X size={20} /></button>
        {galleryImages ? (
          <div className="modal-gallery">
            {galleryImages.map((image, index) => <img key={`${image.src}-${index}`} src={image.src} alt={image.name || `${item.title} preview ${index + 1}`} />)}
          </div>
        ) : (
          <img className={item.type === 'resume' ? 'resume-preview-image' : ''} src={item.image} alt={item.title} />
        )}
        <div>
          <h3>{item.title}</h3>
          <p>{item.issuer} - {item.date}</p>
          <img src={qrUrl(item.link)} alt={`${item.title} QR`} />
          <div className="modal-actions">
            <a className="primary-btn" href={item.pdf || item.image} download={item.type === 'resume' ? 'Abhishek_Jatav_Resume.pdf' : undefined}><Download size={17} /> Download</a>
            {item.pdf && <a className="secondary-btn" href={item.pdf} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Open PDF</a>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Toast({ message }) {
  return <motion.div className="toast" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{message}</motion.div>;
}

function ParticleField() {
  return <div className="particles" aria-hidden="true">{Array.from({ length: 20 }).map((_, i) => <span key={i} style={{ '--i': i }} />)}</div>;
}

function Footer() {
  return (
    <footer>
      <div className="footer-socials">
        <a className="icon-button social linkedin-link" href={LINKEDIN} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin size={18} /></a>
        <a className="icon-button social" href={GITHUB} target="_blank" rel="noreferrer" title="GitHub"><Github size={18} /></a>
        <span className="footer-qr"><img src={qrUrl(LINKEDIN, 120)} alt="LinkedIn profile QR code" /></span>
      </div>
      <p>© 2026 Abhishek Portfolio. Built for Abhishek Jatav as a professional AI data analyst dashboard.</p>
    </footer>
  );
}

function chartOptions(radial) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { boxWidth: 10 } } },
    scales: radial ? { r: { beginAtZero: true, max: 100, ticks: { display: false } } } : { y: { beginAtZero: true, max: 100 }, x: { ticks: { maxRotation: 45, minRotation: 0 } } }
  };
}

function upsertMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

const rootElement = document.getElementById('root');
globalThis.__abhishekPortfolioRoot ||= createRoot(rootElement);
globalThis.__abhishekPortfolioRoot.render(<App />);
