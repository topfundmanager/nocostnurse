const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const formData = JSON.parse(event.body);
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
            referral_consent
        } = formData;

        // Simple validation
        if (!nominator_email || !nominee_first_name || !nominee_phone) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        const { data, error } = await resend.emails.send({
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
        });

        if (error) {
            console.error('Resend Error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to send email' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Referral submitted successfully', id: data.id }),
        };
    } catch (err) {
        console.error('Server side error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
