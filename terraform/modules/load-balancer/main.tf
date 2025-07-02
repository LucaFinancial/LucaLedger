resource "google_compute_global_address" "default" {
  name = "${var.name}-lb-ip"
}

resource "google_compute_managed_ssl_certificate" "default" {
  name = "${var.name}-ssl-cert"

  managed {
    domains = var.ssl_domains
  }
}

resource "google_compute_backend_bucket" "default" {
  name        = "${var.name}-backend-bucket"
  bucket_name = var.bucket_name
  enable_cdn  = true
}

resource "google_compute_url_map" "default" {
  name            = "${var.name}-url-map"
  default_service = google_compute_backend_bucket.default.id
}

resource "google_compute_target_https_proxy" "default" {
  name             = "${var.name}-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

resource "google_compute_global_forwarding_rule" "default" {
  name                  = "${var.name}-https-forwarding-rule"
  ip_address            = google_compute_global_address.default.address
  port_range            = "443"
  target                = google_compute_target_https_proxy.default.id
  load_balancing_scheme = "EXTERNAL"
}