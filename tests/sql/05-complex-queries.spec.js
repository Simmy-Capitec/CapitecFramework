import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 5: COMPLEX QUERIES & BUSINESS LOGIC (SQL Equivalent to API Complex Workflows)
 * Learning Objectives:
 * - Advanced JOINs and subqueries
 * - Aggregate functions and GROUP BY
 * - Window functions and analytics
 * - Complex business logic queries
 * - Performance considerations
 * - Data analysis and reporting
 */

const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};

let connection;

test.beforeEach(async () => {
    connection = await mysql.createConnection(dbConfig);
});

test.afterEach(async () => {
    if (connection) {
        await connection.end();
    }
});

test.describe('Level 5: Complex Queries & Business Logic', () => {
    
    test('should generate comprehensive order analysis', async () => {
        // Complex query to analyze order patterns
        const [orderAnalysis] = await connection.execute(`
            SELECT 
                DATE(o.created_at) as order_date,
                COUNT(*) as total_orders,
                SUM(o.total_amount) as daily_revenue,
                AVG(o.total_amount) as avg_order_value,
                MIN(o.total_amount) as min_order_value,
                MAX(o.total_amount) as max_order_value,
                COUNT(DISTINCT o.user_id) as unique_customers
            FROM orders o
            WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(o.created_at)
            ORDER BY order_date DESC
            LIMIT 10
        `);
        
        expect(Array.isArray(orderAnalysis)).toBe(true);
        
        // Verify analysis structure
        orderAnalysis.forEach(day => {
            expect(day).toHaveProperty('order_date');
            expect(day).toHaveProperty('total_orders');
            expect(day).toHaveProperty('daily_revenue');
            expect(day).toHaveProperty('avg_order_value');
            expect(day).toHaveProperty('min_order_value');
            expect(day).toHaveProperty('max_order_value');
            expect(day).toHaveProperty('unique_customers');
            
            expect(day.total_orders).toBeGreaterThanOrEqual(0);
            expect(parseFloat(day.daily_revenue)).toBeGreaterThanOrEqual(0);
            expect(day.unique_customers).toBeGreaterThanOrEqual(0);
            expect(day.unique_customers).toBeLessThanOrEqual(day.total_orders);
        });
    });

    test('should calculate customer lifetime value and behavior', async () => {
        // Complex customer analysis query
        const [customerAnalysis] = await connection.execute(`
            SELECT 
                u.id,
                u.username,
                u.email,
                COUNT(o.id) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as lifetime_value,
                COALESCE(AVG(o.total_amount), 0) as avg_order_value,
                MAX(o.created_at) as last_order_date,
                MIN(o.created_at) as first_order_date,
                DATEDIFF(MAX(o.created_at), MIN(o.created_at)) as customer_lifespan_days,
                (SELECT COUNT(*) FROM cart_items ci WHERE ci.user_id = u.id) as items_in_cart,
                (SELECT COUNT(*) FROM reviews r WHERE r.user_id = u.id) as reviews_written,
                CASE 
                    WHEN COUNT(o.id) = 0 THEN 'No Orders'
                    WHEN COUNT(o.id) = 1 THEN 'Single Purchase'
                    WHEN COUNT(o.id) BETWEEN 2 AND 5 THEN 'Regular Customer'
                    WHEN COUNT(o.id) > 5 THEN 'VIP Customer'
                END as customer_segment
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id, u.username, u.email
            HAVING total_orders > 0 OR items_in_cart > 0
            ORDER BY lifetime_value DESC, total_orders DESC
            LIMIT 20
        `);
        
        expect(Array.isArray(customerAnalysis)).toBe(true);
        
        customerAnalysis.forEach(customer => {
            expect(customer).toHaveProperty('id');
            expect(customer).toHaveProperty('username');
            expect(customer).toHaveProperty('email');
            expect(customer).toHaveProperty('total_orders');
            expect(customer).toHaveProperty('lifetime_value');
            expect(customer).toHaveProperty('customer_segment');
            
            expect(customer.total_orders).toBeGreaterThanOrEqual(0);
            expect(parseFloat(customer.lifetime_value)).toBeGreaterThanOrEqual(0);
            expect(['No Orders', 'Single Purchase', 'Regular Customer', 'VIP Customer']).toContain(customer.customer_segment);
        });
    });

    test('should analyze product performance and inventory', async () => {
        // Complex product analysis with sales data
        const [productAnalysis] = await connection.execute(`
            SELECT 
                p.id,
                p.sku,
                p.name,
                p.price,
                p.stock_quantity,
                p.reorder_level,
                c.name as category_name,
                COALESCE(sales_data.total_sold, 0) as total_quantity_sold,
                COALESCE(sales_data.total_revenue, 0) as total_revenue,
                COALESCE(sales_data.order_count, 0) as times_ordered,
                COALESCE(review_data.review_count, 0) as review_count,
                COALESCE(review_data.avg_rating, 0) as avg_rating,
                COALESCE(cart_data.in_carts, 0) as currently_in_carts,
                CASE 
                    WHEN p.stock_quantity <= p.reorder_level THEN 'Reorder Required'
                    WHEN p.stock_quantity <= (p.reorder_level * 2) THEN 'Low Stock'
                    ELSE 'Normal Stock'
                END as stock_status,
                CASE 
                    WHEN COALESCE(sales_data.total_sold, 0) = 0 THEN 'No Sales'
                    WHEN COALESCE(sales_data.total_sold, 0) < 10 THEN 'Low Sales'
                    WHEN COALESCE(sales_data.total_sold, 0) < 50 THEN 'Medium Sales'
                    ELSE 'High Sales'
                END as sales_performance
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN (
                SELECT 
                    oi.product_id,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.total_price) as total_revenue,
                    COUNT(DISTINCT oi.order_id) as order_count
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status IN ('processing', 'shipped', 'delivered')
                GROUP BY oi.product_id
            ) sales_data ON p.id = sales_data.product_id
            LEFT JOIN (
                SELECT 
                    r.product_id,
                    COUNT(*) as review_count,
                    AVG(r.rating) as avg_rating
                FROM reviews r
                GROUP BY r.product_id
            ) review_data ON p.id = review_data.product_id
            LEFT JOIN (
                SELECT 
                    ci.product_id,
                    COUNT(*) as in_carts
                FROM cart_items ci
                GROUP BY ci.product_id
            ) cart_data ON p.id = cart_data.product_id
            WHERE p.is_active = 1
            ORDER BY total_revenue DESC, total_quantity_sold DESC
            LIMIT 25
        `);
        
        expect(Array.isArray(productAnalysis)).toBe(true);
        
        productAnalysis.forEach(product => {
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('sku');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('stock_quantity');
            expect(product).toHaveProperty('total_quantity_sold');
            expect(product).toHaveProperty('total_revenue');
            expect(product).toHaveProperty('review_count');
            expect(product).toHaveProperty('avg_rating');
            expect(product).toHaveProperty('stock_status');
            expect(product).toHaveProperty('sales_performance');
            
            expect(['Reorder Required', 'Low Stock', 'Normal Stock']).toContain(product.stock_status);
            expect(['No Sales', 'Low Sales', 'Medium Sales', 'High Sales']).toContain(product.sales_performance);
            
            if (product.review_count > 0) {
                expect(product.avg_rating).toBeGreaterThan(0);
                expect(product.avg_rating).toBeLessThanOrEqual(5);
            }
        });
    });

    test('should generate sales funnel analysis', async () => {
        // Sales funnel: Users -> Cart -> Orders -> Completed Orders
        const [funnelAnalysis] = await connection.execute(`
            SELECT 
                'Total Users' as stage,
                COUNT(*) as count,
                100.0 as percentage
            FROM users
            WHERE is_active = 1
            
            UNION ALL
            
            SELECT 
                'Users with Cart Items' as stage,
                COUNT(DISTINCT ci.user_id) as count,
                ROUND(
                    (COUNT(DISTINCT ci.user_id) * 100.0) / 
                    (SELECT COUNT(*) FROM users WHERE is_active = 1), 
                    2
                ) as percentage
            FROM cart_items ci
            
            UNION ALL
            
            SELECT 
                'Users with Orders' as stage,
                COUNT(DISTINCT o.user_id) as count,
                ROUND(
                    (COUNT(DISTINCT o.user_id) * 100.0) / 
                    (SELECT COUNT(*) FROM users WHERE is_active = 1), 
                    2
                ) as percentage
            FROM orders o
            
            UNION ALL
            
            SELECT 
                'Users with Completed Orders' as stage,
                COUNT(DISTINCT o.user_id) as count,
                ROUND(
                    (COUNT(DISTINCT o.user_id) * 100.0) / 
                    (SELECT COUNT(*) FROM users WHERE is_active = 1), 
                    2
                ) as percentage
            FROM orders o
            WHERE o.status = 'delivered'
        `);
        
        expect(funnelAnalysis.length).toBe(4);
        
        const stages = ['Total Users', 'Users with Cart Items', 'Users with Orders', 'Users with Completed Orders'];
        funnelAnalysis.forEach((stage, index) => {
            expect(stage.stage).toBe(stages[index]);
            expect(stage.count).toBeGreaterThanOrEqual(0);
            expect(stage.percentage).toBeGreaterThanOrEqual(0);
            expect(stage.percentage).toBeLessThanOrEqual(100);
        });
        
        // Conversion rates should generally decrease through the funnel
        if (funnelAnalysis.length === 4) {
            expect(funnelAnalysis[0].count).toBeGreaterThanOrEqual(funnelAnalysis[1].count);
            expect(funnelAnalysis[2].count).toBeGreaterThanOrEqual(funnelAnalysis[3].count);
        }
    });

    test('should identify cross-selling opportunities', async () => {
        // Find products frequently bought together
        const [crossSellAnalysis] = await connection.execute(`
            SELECT 
                p1.id as product1_id,
                p1.name as product1_name,
                p2.id as product2_id,
                p2.name as product2_name,
                COUNT(*) as times_bought_together,
                ROUND(AVG(o.total_amount), 2) as avg_order_value
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
            JOIN products p1 ON oi1.product_id = p1.id
            JOIN products p2 ON oi2.product_id = p2.id
            JOIN orders o ON oi1.order_id = o.id
            WHERE o.status IN ('processing', 'shipped', 'delivered')
            AND p1.id < p2.id  -- Avoid duplicate pairs
            GROUP BY p1.id, p1.name, p2.id, p2.name
            HAVING times_bought_together >= 2
            ORDER BY times_bought_together DESC, avg_order_value DESC
            LIMIT 10
        `);
        
        expect(Array.isArray(crossSellAnalysis)).toBe(true);
        
        crossSellAnalysis.forEach(pair => {
            expect(pair).toHaveProperty('product1_id');
            expect(pair).toHaveProperty('product1_name');
            expect(pair).toHaveProperty('product2_id');
            expect(pair).toHaveProperty('product2_name');
            expect(pair).toHaveProperty('times_bought_together');
            expect(pair).toHaveProperty('avg_order_value');
            
            expect(pair.product1_id).not.toBe(pair.product2_id);
            expect(pair.times_bought_together).toBeGreaterThanOrEqual(2);
            expect(parseFloat(pair.avg_order_value)).toBeGreaterThan(0);
        });
    });

    test('should calculate advanced inventory metrics', async () => {
        // Advanced inventory analysis
        const [inventoryMetrics] = await connection.execute(`
            SELECT 
                c.name as category,
                COUNT(p.id) as total_products,
                SUM(p.stock_quantity) as total_stock_units,
                SUM(p.stock_quantity * p.price) as total_inventory_value,
                AVG(p.price) as avg_product_price,
                COUNT(CASE WHEN p.stock_quantity <= p.reorder_level THEN 1 END) as products_needing_reorder,
                ROUND(
                    (COUNT(CASE WHEN p.stock_quantity <= p.reorder_level THEN 1 END) * 100.0) / COUNT(p.id), 
                    2
                ) as reorder_percentage,
                COALESCE(sales_metrics.total_sold_last_30_days, 0) as units_sold_last_30_days,
                CASE 
                    WHEN COALESCE(sales_metrics.total_sold_last_30_days, 0) = 0 THEN NULL
                    ELSE ROUND(SUM(p.stock_quantity) / sales_metrics.total_sold_last_30_days, 1)
                END as days_of_inventory_remaining
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
            LEFT JOIN (
                SELECT 
                    p_sales.category_id,
                    SUM(oi.quantity) as total_sold_last_30_days
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN products p_sales ON oi.product_id = p_sales.id
                WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                AND o.status IN ('processing', 'shipped', 'delivered')
                GROUP BY p_sales.category_id
            ) sales_metrics ON c.id = sales_metrics.category_id
            GROUP BY c.id, c.name, sales_metrics.total_sold_last_30_days
            HAVING total_products > 0
            ORDER BY total_inventory_value DESC
        `);
        
        expect(Array.isArray(inventoryMetrics)).toBe(true);
        
        inventoryMetrics.forEach(category => {
            expect(category).toHaveProperty('category');
            expect(category).toHaveProperty('total_products');
            expect(category).toHaveProperty('total_stock_units');
            expect(category).toHaveProperty('total_inventory_value');
            expect(category).toHaveProperty('products_needing_reorder');
            expect(category).toHaveProperty('reorder_percentage');
            
            expect(category.total_products).toBeGreaterThan(0);
            expect(category.total_stock_units).toBeGreaterThanOrEqual(0);
            expect(parseFloat(category.total_inventory_value)).toBeGreaterThanOrEqual(0);
            expect(category.products_needing_reorder).toBeGreaterThanOrEqual(0);
            expect(category.products_needing_reorder).toBeLessThanOrEqual(category.total_products);
            expect(category.reorder_percentage).toBeGreaterThanOrEqual(0);
            expect(category.reorder_percentage).toBeLessThanOrEqual(100);
        });
    });

    test('should analyze customer segmentation', async () => {
        // RFM Analysis (Recency, Frequency, Monetary)
        const [customerSegmentation] = await connection.execute(`
            WITH customer_metrics AS (
                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    COALESCE(MAX(o.created_at), u.created_at) as last_order_date,
                    DATEDIFF(NOW(), COALESCE(MAX(o.created_at), u.created_at)) as recency_days,
                    COUNT(o.id) as frequency,
                    COALESCE(SUM(o.total_amount), 0) as monetary_value
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('processing', 'shipped', 'delivered')
                WHERE u.is_active = 1
                GROUP BY u.id, u.username, u.email, u.created_at
            ),
            rfm_scores AS (
                SELECT 
                    *,
                    CASE 
                        WHEN recency_days <= 30 THEN 5
                        WHEN recency_days <= 60 THEN 4
                        WHEN recency_days <= 90 THEN 3
                        WHEN recency_days <= 180 THEN 2
                        ELSE 1
                    END as recency_score,
                    CASE 
                        WHEN frequency >= 10 THEN 5
                        WHEN frequency >= 5 THEN 4
                        WHEN frequency >= 3 THEN 3
                        WHEN frequency >= 1 THEN 2
                        ELSE 1
                    END as frequency_score,
                    CASE 
                        WHEN monetary_value >= 1000 THEN 5
                        WHEN monetary_value >= 500 THEN 4
                        WHEN monetary_value >= 200 THEN 3
                        WHEN monetary_value >= 50 THEN 2
                        ELSE 1
                    END as monetary_score
                FROM customer_metrics
            )
            SELECT 
                id,
                username,
                email,
                recency_days,
                frequency,
                monetary_value,
                recency_score,
                frequency_score,
                monetary_score,
                (recency_score + frequency_score + monetary_score) as total_score,
                CASE 
                    WHEN (recency_score + frequency_score + monetary_score) >= 13 THEN 'VIP Champions'
                    WHEN (recency_score + frequency_score + monetary_score) >= 10 THEN 'Loyal Customers'
                    WHEN (recency_score + frequency_score + monetary_score) >= 7 THEN 'Potential Loyalists'
                    WHEN (recency_score + frequency_score + monetary_score) >= 5 THEN 'New Customers'
                    ELSE 'At Risk'
                END as customer_segment
            FROM rfm_scores
            ORDER BY total_score DESC, monetary_value DESC
            LIMIT 30
        `);
        
        expect(Array.isArray(customerSegmentation)).toBe(true);
        
        customerSegmentation.forEach(customer => {
            expect(customer).toHaveProperty('id');
            expect(customer).toHaveProperty('username');
            expect(customer).toHaveProperty('recency_days');
            expect(customer).toHaveProperty('frequency');
            expect(customer).toHaveProperty('monetary_value');
            expect(customer).toHaveProperty('recency_score');
            expect(customer).toHaveProperty('frequency_score');
            expect(customer).toHaveProperty('monetary_score');
            expect(customer).toHaveProperty('total_score');
            expect(customer).toHaveProperty('customer_segment');
            
            expect(customer.recency_score).toBeGreaterThanOrEqual(1);
            expect(customer.recency_score).toBeLessThanOrEqual(5);
            expect(customer.frequency_score).toBeGreaterThanOrEqual(1);
            expect(customer.frequency_score).toBeLessThanOrEqual(5);
            expect(customer.monetary_score).toBeGreaterThanOrEqual(1);
            expect(customer.monetary_score).toBeLessThanOrEqual(5);
            
            const validSegments = ['VIP Champions', 'Loyal Customers', 'Potential Loyalists', 'New Customers', 'At Risk'];
            expect(validSegments).toContain(customer.customer_segment);
        });
    });

    test('should identify seasonal patterns and trends', async () => {
        // Seasonal analysis
        const [seasonalAnalysis] = await connection.execute(`
            SELECT 
                YEAR(created_at) as year,
                MONTH(created_at) as month,
                MONTHNAME(created_at) as month_name,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_order_value,
                COUNT(DISTINCT user_id) as unique_customers,
                ROUND(SUM(total_amount) / COUNT(DISTINCT user_id), 2) as revenue_per_customer
            FROM orders
            WHERE status IN ('processing', 'shipped', 'delivered')
            AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at), MONTHNAME(created_at)
            ORDER BY year DESC, month DESC
        `);
        
        expect(Array.isArray(seasonalAnalysis)).toBe(true);
        
        seasonalAnalysis.forEach(period => {
            expect(period).toHaveProperty('year');
            expect(period).toHaveProperty('month');
            expect(period).toHaveProperty('month_name');
            expect(period).toHaveProperty('total_orders');
            expect(period).toHaveProperty('total_revenue');
            expect(period).toHaveProperty('avg_order_value');
            expect(period).toHaveProperty('unique_customers');
            expect(period).toHaveProperty('revenue_per_customer');
            
            expect(period.month).toBeGreaterThanOrEqual(1);
            expect(period.month).toBeLessThanOrEqual(12);
            expect(period.total_orders).toBeGreaterThanOrEqual(0);
            expect(parseFloat(period.total_revenue)).toBeGreaterThanOrEqual(0);
            expect(period.unique_customers).toBeGreaterThanOrEqual(0);
            expect(period.unique_customers).toBeLessThanOrEqual(period.total_orders);
        });
    });

    test('should calculate comprehensive business KPIs', async () => {
        // Key Performance Indicators dashboard query
        const [businessKPIs] = await connection.execute(`
            SELECT 
                -- Revenue Metrics
                (SELECT COUNT(*) FROM orders WHERE status IN ('processing', 'shipped', 'delivered')) as total_orders,
                (SELECT SUM(total_amount) FROM orders WHERE status IN ('processing', 'shipped', 'delivered')) as total_revenue,
                (SELECT AVG(total_amount) FROM orders WHERE status IN ('processing', 'shipped', 'delivered')) as avg_order_value,
                
                -- Customer Metrics
                (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_active_users,
                (SELECT COUNT(DISTINCT user_id) FROM orders) as customers_with_orders,
                ROUND(
                    (SELECT COUNT(DISTINCT user_id) FROM orders) * 100.0 / 
                    (SELECT COUNT(*) FROM users WHERE is_active = 1), 
                    2
                ) as customer_conversion_rate,
                
                -- Product Metrics
                (SELECT COUNT(*) FROM products WHERE is_active = 1) as active_products,
                (SELECT COUNT(*) FROM products WHERE stock_quantity <= reorder_level) as products_low_stock,
                (SELECT SUM(stock_quantity * price) FROM products WHERE is_active = 1) as total_inventory_value,
                
                -- Review Metrics
                (SELECT COUNT(*) FROM reviews) as total_reviews,
                (SELECT AVG(rating) FROM reviews) as avg_product_rating,
                (SELECT COUNT(DISTINCT product_id) FROM reviews) as products_with_reviews,
                
                -- Cart Metrics
                (SELECT COUNT(DISTINCT user_id) FROM cart_items) as users_with_cart_items,
                (SELECT SUM(ci.quantity * p.price) 
                 FROM cart_items ci 
                 JOIN products p ON ci.product_id = p.id) as total_cart_value,
                
                -- Recent Activity (Last 30 Days)
                (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as orders_last_30_days,
                (SELECT SUM(total_amount) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status IN ('processing', 'shipped', 'delivered')) as revenue_last_30_days,
                (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_last_30_days,
                (SELECT COUNT(*) FROM reviews WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as reviews_last_30_days
        `);
        
        expect(businessKPIs.length).toBe(1);
        
        const kpis = businessKPIs[0];
        
        // Verify all KPIs are present and reasonable
        expect(kpis).toHaveProperty('total_orders');
        expect(kpis).toHaveProperty('total_revenue');
        expect(kpis).toHaveProperty('avg_order_value');
        expect(kpis).toHaveProperty('total_active_users');
        expect(kpis).toHaveProperty('customers_with_orders');
        expect(kpis).toHaveProperty('customer_conversion_rate');
        expect(kpis).toHaveProperty('active_products');
        expect(kpis).toHaveProperty('products_low_stock');
        expect(kpis).toHaveProperty('total_inventory_value');
        expect(kpis).toHaveProperty('total_reviews');
        expect(kpis).toHaveProperty('avg_product_rating');
        expect(kpis).toHaveProperty('products_with_reviews');
        expect(kpis).toHaveProperty('users_with_cart_items');
        expect(kpis).toHaveProperty('total_cart_value');
        expect(kpis).toHaveProperty('orders_last_30_days');
        expect(kpis).toHaveProperty('revenue_last_30_days');
        expect(kpis).toHaveProperty('new_users_last_30_days');
        expect(kpis).toHaveProperty('reviews_last_30_days');
        
        // Verify data consistency
        expect(kpis.total_orders).toBeGreaterThanOrEqual(0);
        expect(parseFloat(kpis.total_revenue || 0)).toBeGreaterThanOrEqual(0);
        expect(kpis.total_active_users).toBeGreaterThanOrEqual(0);
        expect(kpis.customers_with_orders).toBeLessThanOrEqual(kpis.total_active_users);
        expect(kpis.customer_conversion_rate).toBeGreaterThanOrEqual(0);
        expect(kpis.customer_conversion_rate).toBeLessThanOrEqual(100);
        expect(kpis.active_products).toBeGreaterThanOrEqual(0);
        expect(kpis.products_low_stock).toBeGreaterThanOrEqual(0);
        expect(kpis.products_low_stock).toBeLessThanOrEqual(kpis.active_products);
        
        if (kpis.total_reviews > 0) {
            expect(parseFloat(kpis.avg_product_rating)).toBeGreaterThan(0);
            expect(parseFloat(kpis.avg_product_rating)).toBeLessThanOrEqual(5);
        }
        
        expect(kpis.orders_last_30_days).toBeLessThanOrEqual(kpis.total_orders);
        expect(kpis.new_users_last_30_days).toBeLessThanOrEqual(kpis.total_active_users);
    });
});