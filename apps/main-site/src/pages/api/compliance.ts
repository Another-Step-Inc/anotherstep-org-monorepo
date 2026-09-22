import type { APIRoute } from 'astro';
import { handleComplianceSubmit } from '@anothersteporg/ui/lib/api';

export const POST: APIRoute = ({ request }) => {
  return handleComplianceSubmit(request, import.meta.env.POWER_AUTOMATE_COMPLIANCE_URL);
};