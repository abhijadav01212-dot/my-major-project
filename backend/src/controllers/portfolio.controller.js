import { all, get, getDb, run } from '../database/sqlite.js';

function safeJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || '');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value) {
  return String(value || 'project')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;
}

function normalizeProject(project) {
  const title = String(project.title || '').trim();
  const id = String(project.id || slugify(title)).trim();
  const tags = Array.isArray(project.tags) ? project.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [];
  const images = Array.isArray(project.images) ? project.images.filter((image) => image && image.src) : [];
  return {
    id,
    title,
    description: String(project.description || '').trim(),
    tags,
    images,
    projectLink: String(project.projectLink || project.project_link || '').trim(),
    githubLink: String(project.githubLink || project.github_link || '').trim()
  };
}

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: safeJson(row.tags_json, []),
    images: safeJson(row.images_json, []),
    projectLink: row.project_link,
    githubLink: row.github_link,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function saveProject(project) {
  const clean = normalizeProject(project);
  if (!clean.title) {
    const error = new Error('Project title is required');
    error.status = 400;
    throw error;
  }
  run(
    `INSERT INTO portfolio_projects (id, title, description, tags_json, images_json, project_link, github_link)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       tags_json = excluded.tags_json,
       images_json = excluded.images_json,
       project_link = excluded.project_link,
       github_link = excluded.github_link,
       updated_at = CURRENT_TIMESTAMP`,
    [
      clean.id,
      clean.title,
      clean.description,
      JSON.stringify(clean.tags),
      JSON.stringify(clean.images),
      clean.projectLink,
      clean.githubLink
    ]
  );
  return mapProject(get('SELECT * FROM portfolio_projects WHERE id = ?', [clean.id]));
}

export async function listPortfolioProjects(_req, res) {
  res.json(all('SELECT * FROM portfolio_projects ORDER BY created_at DESC').map(mapProject));
}

export async function createPortfolioProject(req, res) {
  const project = saveProject(req.body || {});
  res.status(201).json(project);
}

export async function updatePortfolioProject(req, res) {
  const existing = get('SELECT id FROM portfolio_projects WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  const project = saveProject({ ...(req.body || {}), id: req.params.id });
  res.json(project);
}

export async function replacePortfolioProjects(req, res) {
  const projects = Array.isArray(req.body?.projects) ? req.body.projects : [];
  const db = getDb();
  db.exec('BEGIN');
  try {
    run('DELETE FROM portfolio_projects');
    for (const project of projects) saveProject(project);
    db.exec('COMMIT');
    res.json(all('SELECT * FROM portfolio_projects ORDER BY created_at DESC').map(mapProject));
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export async function deletePortfolioProject(req, res) {
  const existing = get('SELECT id FROM portfolio_projects WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  run('DELETE FROM portfolio_projects WHERE id = ?', [req.params.id]);
  res.json({ message: 'Project deleted', id: req.params.id });
}
