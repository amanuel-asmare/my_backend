const createPayment = async(req, res) => {
    try {
        const { username, landArea, taxAmount, currency } = req.body;

        if (!username || !landArea || !taxAmount || !currency) {
            console.log('Missing required payment information:', req.body);
            return res.status(400).json({
                error: 'Missing required payment information'
            });
        }

        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            redirect_urls: {
                return_url: `${process.env.APP_URL || 'http://localhost:2000'}/api/payment/success`,
                cancel_url: `${process.env.APP_URL || 'http://localhost:2000'}/api/payment/cancel`
            },
            transactions: [{
                item_list: {
                    items: [{
                        name: 'Land Tax Payment',
                        sku: 'TAX001',
                        price: taxAmount.toFixed(2),
                        currency: currency,
                        quantity: 1
                    }]
                },
                amount: {
                    currency: currency,
                    total: taxAmount.toFixed(2)
                },
                description: `Land tax payment for area: ${landArea} square meters`
            }]
        };

        console.log('Creating PayPal payment with config:', JSON.stringify(create_payment_json, null, 2));

        paypal.payment.create(create_payment_json, async function(error, payment) {
            if (error) {
                console.error('PayPal Error Details:', JSON.stringify(error, null, 2));
                return res.status(500).json({ error: error.message, details: error });
            }

            try {
                const newPayment = new Payment({
                    username: username,
                    landArea: landArea,
                    taxAmount: taxAmount,
                    currency: currency,
                    paymentId: payment.id,
                    status: 'pending'
                });
                await newPayment.save();
                console.log('Payment saved to DB:', newPayment);

                const approvalLink = payment.links.find(link => link.rel === 'approval_url');
                const approvalUrl = approvalLink ? approvalLink.href : null;

                if (!approvalUrl) {
                    console.error('No approval URL found in PayPal response');
                    throw new Error('No approval URL found in PayPal response');
                }

                console.log('Approval URL:', approvalUrl);
                res.status(200).json({ approvalUrl });
            } catch (dbError) {
                console.error('Database Error:', dbError);
                res.status(500).json({ error: 'Failed to save payment information', details: dbError.message });
            }
        });
    } catch (error) {
        console.error('Payment Creation Error:', error);
        res.status(500).json({ error: error.message, details: error });
    }
};