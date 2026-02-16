const _0x4a2e = 'ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW10c2FHbDNaWGRuWkhGNmNHTnVabmx1Y0hKdklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTmpnek5qWTJOelVzSW1WNGNDSTZNakE0TXprME1qWTNOWDAuSlhIQ1luWkh2cElRUGNuakt3cGJRQ24yZ2xTTlE2a1c3M2JkUHk2OHN0UQ==';
const _0x1b2c = 'https://klhiwewgdqzpcnfynpro.supabase.co';

const supabaseClient = supabase.createClient(_0x1b2c, atob(_0x4a2e), {
    auth: {
        flowType: 'implicit',
        persistSession: true,
        autoRefreshToken: true
    }
});

const setupForm = document.getElementById('setupForm');
const submitBtn = document.getElementById('submitBtn');
const errorBox = document.getElementById('error-box');
const setupFormContent = document.getElementById('setup-form-content');
const successBlock = document.getElementById('success-block');
const userEmailDisplay = document.getElementById('user-email');
const loader = document.getElementById('initial-loader');

let userEmail = '';
let hashedToken = '';

function decodeBase64URL(str) {
    try {
        str = str.trim().replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        const binary = atob(str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (err) {
        return null;
    }
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    setupForm.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Finalize Setup';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');

    if (!token) {
        loader.style.display = 'none';
        showError('Invalid or missing invitation token.');
        return;
    }

    try {
        const decodedStr = decodeBase64URL(token);
        if (!decodedStr) throw new Error('Invalid token format.');
        
        let decoded;
        try {
            decoded = JSON.parse(decodedStr);
        } catch (je) {
            throw new Error('Malformed token data.');
        }

        userEmail = decoded.e;
        hashedToken = decoded.t;

        if (!userEmail || !hashedToken) throw new Error('Incomplete token.');
        
        userEmailDisplay.textContent = userEmail;

        const { data: { session: existing } } = await supabaseClient.auth.getSession();
        let session = existing;

        if (!session || session.user.email?.toLowerCase() !== userEmail.toLowerCase()) {
            const { data, error } = await supabaseClient.auth.verifyOtp({
                token_hash: hashedToken,
                type: 'magiclink'
            });
            if (error) throw error;
            session = data.session;
        }

        if (session) {
            const { data, error } = await supabaseClient
                .from('users')
                .select('weight, height, fitness_goal, diet_preference, has_acknowledged_invitation, is_invited')
                .eq('auth_id', session.user.id)
                .maybeSingle();
            
            if (data) {
                if (data.has_acknowledged_invitation) {
                    throw new Error('Account setup already completed.');
                }
                if (data.is_invited === false) {
                    throw new Error('This invitation is invalid or no longer active.');
                }
                if (data.weight) document.getElementById('weight').value = data.weight;
                if (data.height) document.getElementById('height').value = data.height;
                if (data.fitness_goal) document.getElementById('fitnessGoal').value = data.fitness_goal;
                if (data.diet_preference) document.getElementById('dietPreference').value = data.diet_preference;
            }
            setupForm.style.display = 'block';
        }
    } catch (e) {
        showError(e.message || 'Verification failed.');
    } finally {
        loader.style.display = 'none';
    }
}

setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const goal = document.getElementById('fitnessGoal').value;
    const diet = document.getElementById('dietPreference').value;

    if (password !== confirm) return showError('Passwords do not match.');
    if (password.length < 6) return showError('Password must be at least 6 characters.');

    errorBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Finalizing...';

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) throw new Error('No active session.');

        const { error } = await supabaseClient.rpc('complete_invitation_setup', {
            p_password: password,
            p_full_name: userEmail.split('@')[0], 
            p_weight: weight ? parseFloat(weight) : null,
            p_height: height ? parseFloat(height) : null,
            p_diet_preference: diet || null,
            p_fitness_goal: goal || null,
            p_date_of_birth: null
        });

        if (error) throw error;

        setupFormContent.style.display = 'none';
        successBlock.style.display = 'block';
    } catch (err) {
        showError(err.message || 'Setup failed.');
    }
});

init();
