export async function handleComplianceSubmit(request: Request, webhookUrl: string) {
  const formData = await request.formData();
  
  const payload = {
    reporterName: formData.get('reporterName')?.toString() || 'Anonymous',
    dateOfOccurrence: formData.get('dateOfOccurrence')?.toString(),
    location: formData.get('location')?.toString(),
    details: formData.get('details')?.toString(),
    personsInvolved: formData.get('personsInvolved')?.toString(),
    discussedInternal: formData.get('discussedInternal')?.toString(),
    internalContacts: formData.get('internalContacts')?.toString(),
    discussedExternal: formData.get('discussedExternal')?.toString(),
    externalContacts: formData.get('externalContacts')?.toString(),
    submittedAt: new Date().toISOString(),
  };

  if (!payload.dateOfOccurrence || !payload.location || !payload.details || !payload.personsInvolved) {
    return new Response(
      JSON.stringify({ error: 'Please fill in all required fields.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Forward to Power Automate / M365 Webhook
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to process submission with backend server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Report submitted successfully.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}