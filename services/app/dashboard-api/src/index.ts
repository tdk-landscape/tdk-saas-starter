import { Hono } from 'hono';

const app = new Hono();

app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    await next();
});

const plans = [
    { id: 'starter', name: 'Starter', activeAccounts: 128 },
    { id: 'growth', name: 'Growth', activeAccounts: 342 },
    { id: 'scale', name: 'Scale', activeAccounts: 57 },
];

const activity = [
    { id: 'evt_501', account: 'Northwind Labs', event: 'Upgraded to Growth', at: '2m ago' },
    { id: 'evt_502', account: 'Fenwick Studio', event: 'Invited 3 teammates', at: '18m ago' },
    { id: 'evt_503', account: 'Basalt Robotics', event: 'Hit the API usage limit', at: '41m ago' },
    { id: 'evt_504', account: 'Ridgeline Co', event: 'Started a 14-day trial', at: '1h ago' },
];

app.get('/health', (c) => c.json({ status: 'ok', service: 'dashboard-api', timestamp: new Date().toISOString() }));

app.get('/api/dashboard-management', (c) => c.json({
    data: {
        service: 'dashboard-management',
        generatedAt: new Date().toISOString(),
        plans,
        activity,
        summary: {
            mrr: 48260,
            mrrGrowth: 6.4,
            activeAccounts: plans.reduce((sum, plan) => sum + plan.activeAccounts, 0),
            trialAccounts: 39,
            churnRate: 1.8,
        },
    },
}));

app.get('/api/v1/metrics', (c) => {
    return c.json({
        data: {
            mrr: 48260,
            mrrGrowth: 6.4,
            activeAccounts: plans.reduce((sum, plan) => sum + plan.activeAccounts, 0),
            trialAccounts: 39,
            churnRate: 1.8,
        },
    });
});

app.get('/api/v1/activity', (c) => {
    return c.json({ data: activity, total: activity.length });
});

export default {
    port: 4200,
    fetch: app.fetch,
};
