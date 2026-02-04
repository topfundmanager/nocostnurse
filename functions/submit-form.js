export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.json();
        const {
            nominator_first_name,
            nominator_last_name,
            nominator_email,
            nominator_phone,
            nominee_first_name,
            nominee_last_name,
            nominee_profession,
            nominee_phone,
            medicaid_approved,
            referral_context,
            referral_consent,
            website,
            form_timestamp
        } = formData;

        // Bot protection: Honeypot check
        // If the hidden "website" field is filled, it's likely a bot
        if (website && website.trim() !== '') {
            console.log('Bot detected: honeypot field filled');
            // Return success to not alert the bot, but don't process
            return new Response(JSON.stringify({ message: 'Referral submitted successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Bot protection: Timing check
        // If form was submitted in less than 3 seconds, likely a bot
        if (form_timestamp) {
            const submissionTime = Date.now();
            const formLoadTime = parseInt(form_timestamp, 10);
            const timeElapsed = submissionTime - formLoadTime;
            const MIN_SUBMISSION_TIME = 3000; // 3 seconds minimum

            if (timeElapsed < MIN_SUBMISSION_TIME) {
                console.log('Bot detected: form submitted too quickly', { timeElapsed });
                // Return success to not alert the bot, but don't process
                return new Response(JSON.stringify({ message: 'Referral submitted successfully' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Simple validation
        if (!nominator_email || !nominee_first_name || !nominee_phone) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const emailContent = {
            from: 'No Cost Nurse <noreply@updates.nocostnurse.com>',
            to: ['crafted@marloweemrys.com'],
            subject: `New Referral: ${nominee_first_name} ${nominee_last_name} (${nominee_profession.toUpperCase()})`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background: #134598; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">New Referral Received</h1>
                    </div>
                    
                    <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
                        <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; color: #154da9;">Step 1: Nominator Info</h2>
                        <p><strong>Name:</strong> ${nominator_first_name} ${nominator_last_name}</p>
                        <p><strong>Email:</strong> ${nominator_email}</p>
                        <p><strong>Phone:</strong> ${nominator_phone}</p>

                        <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 30px; color: #154da9;">Step 2: Candidate Info</h2>
                        <p><strong>Name:</strong> ${nominee_first_name} ${nominee_last_name}</p>
                        <p><strong>Profession:</strong> ${nominee_profession.toUpperCase()}</p>
                        <p><strong>Phone:</strong> ${nominee_phone}</p>

                        <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 30px; color: #154da9;">Step 3: Qualifications</h2>
                        <p><strong>Medicaid Approved in GA:</strong> ${medicaid_approved === 'yes' ? '✅ Yes' : '❓ Unsure'}</p>
                        <p><strong>Context:</strong> ${referral_context || 'N/A'}</p>

                        <h2 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 30px; color: #154da9;">Step 4: Consent</h2>
                        <p><strong>Permission to Contact:</strong> ${referral_consent ? '✅ Given' : '❌ Not Given'}</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                        Sent from No Cost Nurse Referral Network
                    </div>
                </div>
            `,
        };

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailContent),
        });

        if (!resendResponse.ok) {
            const errorText = await resendResponse.text();
            console.error('Resend API Error:', errorText);
            return new Response(JSON.stringify({ error: 'Failed to send email' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await resendResponse.json();
        return new Response(JSON.stringify({ message: 'Referral submitted successfully', id: result.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error('Pages Function Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
