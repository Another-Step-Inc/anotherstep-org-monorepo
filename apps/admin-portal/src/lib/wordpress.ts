export interface StagedPostVersion {
  title: string;
  content: string;
}

export interface PendingStagedPost {
  id: number;
  status: 'pending';
  title: string;
  author: {
    id: number;
    name: string;
  };
  submitted_at: string;
  diff: {
    previous: StagedPostVersion;
    submitted: StagedPostVersion;
  };
}

export type StagingDecision = 'approve' | 'reject' | 'request_changes';

export class WordPressApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'WordPressApiError';
    this.status = status;
  }
}

export class WordPressConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WordPressConfigurationError';
  }
}

function apiBaseUrl(): string {
  const configuredUrl = process.env.WORDPRESS_API_URL;
  const username = process.env.WORDPRESS_API_USERNAME;
  const applicationPassword = process.env.WORDPRESS_API_APPLICATION_PASSWORD;
  if (!configuredUrl || !username || !applicationPassword) {
    throw new WordPressConfigurationError(
      'Configure WORDPRESS_API_URL, WORDPRESS_API_USERNAME, and WORDPRESS_API_APPLICATION_PASSWORD.',
    );
  }
  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new WordPressConfigurationError('WORDPRESS_API_URL must be an absolute URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new WordPressConfigurationError('WORDPRESS_API_URL must use HTTP or HTTPS.');
  }
  return url.toString().replace(/\/+$/, '');
}

async function request<T>(path: string, body?: Record<string, unknown>): Promise<T | undefined> {
  const username = process.env.WORDPRESS_API_USERNAME;
  const applicationPassword = process.env.WORDPRESS_API_APPLICATION_PASSWORD;
  const baseUrl = apiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${applicationPassword}`).toString('base64')}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new WordPressApiError('The WordPress backend could not be reached.', 503);
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    result = undefined;
  }
  if (!response.ok) {
    throw new WordPressApiError(
      response.status === 401 || response.status === 403
        ? 'WordPress rejected the configured account or its permissions.'
        : `The WordPress backend returned HTTP ${response.status}.`,
      response.status,
    );
  }
  return result as T | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPostVersion(value: unknown): value is StagedPostVersion {
  return isRecord(value) && typeof value.title === 'string' && typeof value.content === 'string';
}

function isPendingPost(value: unknown): value is PendingStagedPost {
  if (!isRecord(value) || !isRecord(value.author) || !isRecord(value.diff)) return false;
  return Number.isSafeInteger(value.id)
    && value.status === 'pending'
    && typeof value.title === 'string'
    && Number.isSafeInteger(value.author.id)
    && typeof value.author.name === 'string'
    && typeof value.submitted_at === 'string'
    && isPostVersion(value.diff.previous)
    && isPostVersion(value.diff.submitted);
}

export async function listPendingStagedPosts(): Promise<PendingStagedPost[]> {
  const response = await request<unknown>('/wp-json/anotherstep/v1/staging/pending');
  if (!Array.isArray(response) || !response.every(isPendingPost)) {
    throw new Error('The WordPress pending-content response did not match the expected format.');
  }
  return response;
}

export async function submitStagedPost(
  postId: number,
  title: string,
  content: string,
): Promise<void> {
  await request(
    `/wp-json/anotherstep/v1/staging/${postId}/submit`,
    { title, content },
  );
}

export async function decideStagedPost(
  postId: number,
  decision: StagingDecision,
  note: string,
): Promise<void> {
  await request(
    `/wp-json/anotherstep/v1/staging/${postId}/decision`,
    { decision, note },
  );
}
