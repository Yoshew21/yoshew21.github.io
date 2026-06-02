(function () {
  const repoList = document.getElementById('repo-list');
  const generatedAt = document.getElementById('generated-at');
  const username = 'Yoshew21';

  function createTag(text) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = text;
    return span;
  }

  function formatDate(isoDate) {
    if (!isoDate) {
      return '';
    }
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function setEmptyState(message) {
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.textContent = message;
    repoList.replaceChildren(div);
  }

  function createMetaItem(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }

  function renderRepos(payload) {
    const repos = Array.isArray(payload.repos) ? payload.repos : [];

    if (payload.generatedAt) {
      const formatted = formatDate(payload.generatedAt);
      generatedAt.textContent = formatted
        ? `Données mises à jour le ${formatted}`
        : '';
    } else {
      generatedAt.textContent = 'Données en direct depuis l’API GitHub.';
    }

    if (repos.length === 0) {
      setEmptyState('Aucun repository public trouvé pour le moment.');
      return;
    }

    const fragment = document.createDocumentFragment();

    repos.forEach((repo) => {
      const card = document.createElement('article');
      card.className = 'repo-card';

      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.className = 'repo-link';
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = repo.name;
      title.appendChild(link);

      const description = document.createElement('p');
      description.className = 'muted';
      description.textContent = repo.description || 'Aucune description.';

      const tags = document.createElement('div');
      tags.className = 'tags';
      const langs = Array.isArray(repo.languages) ? repo.languages : [];
      langs.slice(0, 5).forEach((lang) => tags.appendChild(createTag(lang)));
      if (langs.length === 0 && repo.language) {
        tags.appendChild(createTag(repo.language));
      }

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.appendChild(createMetaItem(`Stars: ${repo.stargazers_count ?? 0}`));
      meta.appendChild(createMetaItem(`Forks: ${repo.forks_count ?? 0}`));
      if (repo.updated_at) {
        const date = formatDate(repo.updated_at);
        if (date) {
          meta.appendChild(createMetaItem(`Mis à jour: ${date}`));
        }
      }

      card.append(title, description, tags, meta);
      fragment.appendChild(card);
    });

    repoList.replaceChildren(fragment);
  }

  async function fetchLanguages(url) {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    return Object.entries(payload)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 5);
  }

  async function fetchFromGithubApi() {
    const repos = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&type=public&sort=updated&direction=desc`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      for (const repo of data) {
        let languages = [];
        if (repo.languages_url) {
          try {
            languages = await fetchLanguages(repo.languages_url);
          } catch (error) {
            console.warn(`Languages unavailable for ${repo.name}`, error);
          }
        }

        repos.push({
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          updated_at: repo.updated_at,
          language: repo.language,
          languages
        });
      }

      page += 1;
    }

    return {
      owner: username,
      generatedAt: null,
      repos
    };
  }

  async function loadRepos() {
    try {
      const response = await fetch('data/repos.json');
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload.repos) && payload.repos.length > 0) {
          renderRepos(payload);
          return;
        }
      }

      const apiPayload = await fetchFromGithubApi();
      renderRepos(apiPayload);
    } catch (error) {
      setEmptyState(
        'Impossible de charger la liste des repositories (limite API possible). Réessayez plus tard.'
      );
      console.error(error);
    }
  }

  loadRepos();
})();
