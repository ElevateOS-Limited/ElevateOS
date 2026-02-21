<?php
/**
 * Plugin Name: Arby Rollout Core Upgrades
 * Description: Non-invasive IA/legal/footer/SEO/conversion enhancements for CrystalCentury.
 * Author: Arby Rollout
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) { exit; }

add_action('wp_head', function () {
    if (is_admin()) { return; }
    echo "\n<!-- Arby Rollout: SEO schema layer -->\n";
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => get_bloginfo('name') ?: 'CrystalCentury',
        'url' => home_url('/'),
        'logo' => home_url('/wp-content/uploads/logo.png'),
        'sameAs' => [],
        'contactPoint' => [[
            '@type' => 'ContactPoint',
            'contactType' => 'sales',
            'url' => home_url('/contact-us/'),
            'availableLanguage' => ['en']
        ]]
    ];
    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
}, 99);

add_action('wp_footer', function () {
    if (is_admin()) { return; }
    ?>
    <div class="arby-conversion-footer" style="margin-top:32px;padding:18px;border-top:1px solid #e5e7eb;background:#f9fafb;text-align:center;font-family:inherit;">
      <strong style="font-size:18px;">Need bulk custom trophies for events or schools?</strong>
      <div style="margin-top:8px;">
        <a href="<?php echo esc_url(home_url('/contact-us/')); ?>" style="display:inline-block;background:#1f4ed8;color:#fff;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:600;">Request a Quote</a>
        <a href="<?php echo esc_url(home_url('/shop/')); ?>" style="display:inline-block;margin-left:8px;border:1px solid #1f4ed8;color:#1f4ed8;padding:9px 14px;border-radius:8px;text-decoration:none;font-weight:600;">Browse Products</a>
      </div>
      <p style="margin:10px 0 0;color:#4b5563;font-size:13px;">
        <a href="<?php echo esc_url(home_url('/legal/privacy-policy.html')); ?>">Privacy</a> ·
        <a href="<?php echo esc_url(home_url('/legal/terms-and-conditions.html')); ?>">Terms</a> ·
        <a href="<?php echo esc_url(home_url('/legal/refund-and-returns.html')); ?>">Returns</a> ·
        <a href="<?php echo esc_url(home_url('/legal/shipping-and-delivery.html')); ?>">Shipping</a>
      </p>
    </div>
    <?php
}, 99);
