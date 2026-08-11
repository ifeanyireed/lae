package mailer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Mailer struct {
	ProxyURL string
	APIKey   string
	From     string
	FromName string
	Client   *http.Client
}

func New(proxyURL, apiKey, from, fromName string) *Mailer {
	if proxyURL == "" {
		proxyURL = "https://resultspro.ng/email_proxy/api/send-email.php"
	}
	if apiKey == "" {
		apiKey = "YOUR_EMAIL_PROXY_API_KEY"
	}
	if from == "" {
		from = "info@netslogistics.com"
	}
	if fromName == "" {
		fromName = "Nets Logistics"
	}

	return &Mailer{
		ProxyURL: proxyURL,
		APIKey:   apiKey,
		From:     from,
		FromName: fromName,
		Client: &http.Client{
			Timeout: 12 * time.Second,
		},
	}
}

type SendEmailPayload struct {
	To       string `json:"to"`
	Subject  string `json:"subject"`
	HTML     string `json:"html"`
	Text     string `json:"text,omitempty"`
	From     string `json:"from"`
	FromName string `json:"from_name"`
}

type SendEmailResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// SendEmail sends a transactional email via the Hostinger PHP email proxy API
func (m *Mailer) SendEmail(to, subject, htmlContent, textContent string) error {
	if to == "" {
		return fmt.Errorf("recipient email address is empty")
	}

	payload := SendEmailPayload{
		To:       to,
		Subject:  subject,
		HTML:     htmlContent,
		Text:     textContent,
		From:     m.From,
		FromName: m.FromName,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest("POST", m.ProxyURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to create email http request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", m.APIKey))
	req.Header.Set("X-API-Key", m.APIKey)

	resp, err := m.Client.Do(req)
	if err != nil {
		return fmt.Errorf("email proxy HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	var res SendEmailResponse
	if err := json.Unmarshal(respBody, &res); err != nil {
		if resp.StatusCode >= 400 {
			return fmt.Errorf("email proxy returned HTTP %d: %s", resp.StatusCode, string(respBody))
		}
	}

	if !res.Success && res.Error != "" {
		return fmt.Errorf("email proxy error: %s", res.Error)
	}

	log.Printf("📧 Email successfully dispatched via proxy to %s (Subject: '%s')", to, subject)
	return nil
}

// SendWelcomeEmail dispatches onboarding details to new School / Family accounts
func (m *Mailer) SendWelcomeEmail(toEmail, orgName, orgType, defaultPassword, embedToken string) {
	if toEmail == "" {
		return
	}
	subject := fmt.Sprintf("Welcome to PuzzlePro - %s Account Initialized", orgName)
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<div style="text-align: center; margin-bottom: 24px;">
				<h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">PuzzlePro Learning 🎉</h1>
				<p style="color: #64748b; font-size: 13px; margin-top: 4px;">Gamified Coding Platform for Schools & Families</p>
			</div>

			<p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello <strong>%s</strong>,</p>
			<p style="color: #334155; font-size: 14px; line-height: 1.6;">Your <strong>%s</strong> account is now live and ready to onboard students and explore gamified learning worlds!</p>
			
			<div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
				<h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px;">Your Account Portal Credentials:</h4>
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Email:</strong> %s</p>
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Default Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">%s</code></p>
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Signed iFrame Token:</strong> <br/><span style="font-family: monospace; font-size: 11px; word-break: break-all; color: #0284c7;">%s</span></p>
			</div>

			<p style="color: #334155; font-size: 14px; line-height: 1.6;">You can log into your portal at any time to customize branding, set up campus locations, and view real-time student XP leaderboards.</p>
			
			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Coding Engine • Powered by Nets Logistics
			</div>
		</div>
	`, orgName, orgType, toEmail, defaultPassword, embedToken)

	text := fmt.Sprintf("Welcome to PuzzlePro %s! Account Email: %s, Default Password: %s", orgName, toEmail, defaultPassword)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending welcome email to %s: %v", toEmail, err)
		}
	}()
}

// SendAccessCodeEmail dispatches 8-digit student access code to student/parent
func (m *Mailer) SendAccessCodeEmail(toEmail, studentName, accessCode, groupName string) {
	if toEmail == "" {
		return
	}
	subject := fmt.Sprintf("Student Access Code for %s - PuzzlePro", studentName)
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<h2 style="color: #0f172a; margin-top: 0;">Student Access Code 🔑</h2>
			<p style="color: #334155; font-size: 14px;">Here is the 8-digit student access code for <strong>%s</strong> (%s):</p>
			
			<div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; border: 2px dashed #3b82f6; text-align: center; margin: 24px 0;">
				<span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;">%s</span>
			</div>

			<p style="color: #334155; font-size: 14px;">Enter this 8-digit code on the PuzzlePro student access login screen to resume your coding adventure!</p>
			
			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Coding Engine • Powered by Nets Logistics
			</div>
		</div>
	`, studentName, groupName, accessCode)

	text := fmt.Sprintf("Student Access Code for %s: %s", studentName, accessCode)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending access code email to %s: %v", toEmail, err)
		}
	}()
}

// SendPasswordChangedEmail dispatches security alert on password change
func (m *Mailer) SendPasswordChangedEmail(toEmail, orgName string) {
	if toEmail == "" {
		return
	}
	subject := "Security Alert: Password Updated - PuzzlePro"
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<h2 style="color: #0f172a; margin-top: 0;">Password Updated 🔐</h2>
			<p style="color: #334155; font-size: 14px;">Hello <strong>%s</strong>,</p>
			<p style="color: #334155; font-size: 14px;">Your account password on PuzzlePro was changed successfully.</p>
			<p style="color: #ef4444; font-size: 13px; font-weight: 600;">If you did not request this change, please contact support immediately.</p>
			
			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Security Team • Powered by Nets Logistics
			</div>
		</div>
	`, orgName)

	text := fmt.Sprintf("Security Alert: Password for %s updated successfully.", orgName)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending password change alert to %s: %v", toEmail, err)
		}
	}()
}

// SendSubscriptionEmail dispatches subscription confirmation
func (m *Mailer) SendSubscriptionEmail(toEmail, orgName, planName, seats, price string) {
	if toEmail == "" {
		return
	}
	subject := fmt.Sprintf("Subscription Confirmation: %s Plan Active", planName)
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<h2 style="color: #0f172a; margin-top: 0;">Subscription Confirmed 💳</h2>
			<p style="color: #334155; font-size: 14px;">Hello <strong>%s</strong>,</p>
			<p style="color: #334155; font-size: 14px;">Your subscription plan has been updated successfully:</p>
			
			<div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Plan Name:</strong> %s</p>
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Student Seats Capacity:</strong> %s Seats</p>
				<p style="margin: 6px 0; font-size: 13px; color: #475569;"><strong>Billing Price:</strong> %s</p>
			</div>

			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Billing Team • Powered by Nets Logistics
			</div>
		</div>
	`, orgName, planName, seats, price)

	text := fmt.Sprintf("Subscription for %s updated to %s (%s).", orgName, planName, price)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending subscription email to %s: %v", toEmail, err)
		}
	}()
}

// SendVerificationEmail dispatches a 6-digit OTP verification code
func (m *Mailer) SendVerificationEmail(toEmail, code string) {
	if toEmail == "" {
		return
	}
	subject := "Verify Your Email Address - PuzzlePro"
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<div style="text-align: center; margin-bottom: 24px;">
				<h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">PuzzlePro Verification ✉️</h1>
				<p style="color: #64748b; font-size: 13px; margin-top: 4px;">Confirm your email address to complete onboarding</p>
			</div>

			<p style="color: #334155; font-size: 14px;">Your 6-digit email verification OTP is:</p>
			
			<div style="background-color: #f1f5f9; padding: 20px; border-radius: 16px; border: 2px dashed #0284c7; text-align: center; margin: 20px 0;">
				<span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0369a1; font-family: monospace;">%s</span>
			</div>

			<p style="color: #64748b; font-size: 13px;">This code will expire in 15 minutes. If you did not request this verification, please ignore this email.</p>
			
			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Security Team • Powered by Nets Logistics
			</div>
		</div>
	`, code)

	text := fmt.Sprintf("Your PuzzlePro email verification OTP is: %s. Valid for 15 minutes.", code)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending verification email to %s: %v", toEmail, err)
		}
	}()
}

// SendPasswordResetEmail dispatches a 6-digit password reset OTP
func (m *Mailer) SendPasswordResetEmail(toEmail, code string) {
	if toEmail == "" {
		return
	}
	subject := "Reset Your Password - PuzzlePro"
	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<div style="text-align: center; margin-bottom: 24px;">
				<h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Password Reset Request 🔐</h1>
				<p style="color: #64748b; font-size: 13px; margin-top: 4px;">PuzzlePro Account Security</p>
			</div>

			<p style="color: #334155; font-size: 14px;">You requested to reset your password. Use the following 6-digit verification code to reset your account password:</p>
			
			<div style="background-color: #fef2f2; padding: 20px; border-radius: 16px; border: 2px dashed #ef4444; text-align: center; margin: 20px 0;">
				<span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #b91c1c; font-family: monospace;">%s</span>
			</div>

			<p style="color: #64748b; font-size: 13px;">This reset code will expire in 15 minutes. If you did not request a password reset, please secure your account immediately.</p>
			
			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Security Team • Powered by Nets Logistics
			</div>
		</div>
	`, code)

	text := fmt.Sprintf("Your PuzzlePro password reset code is: %s. Valid for 15 minutes.", code)

	go func() {
		if err := m.SendEmail(toEmail, subject, html, text); err != nil {
			log.Printf("⚠️ Warning: Failed sending password reset email to %s: %v", toEmail, err)
		}
	}()
}

// SendContactMessageEmail dispatches user contact form responses to hello@resultspro.ng
func (m *Mailer) SendContactMessageEmail(name, senderEmail, phone, category, message string) error {
	to := "hello@resultspro.ng"
	subject := fmt.Sprintf("[PuzzlePro Contact] %s - %s", category, name)

	if phone == "" {
		phone = "Not provided"
	}
	if category == "" {
		category = "General Inquiry"
	}

	html := fmt.Sprintf(`
		<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
			<div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
				<h1 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800;">New Contact Form Message 📩</h1>
				<p style="color: #64748b; font-size: 13px; margin-top: 4px;">PuzzlePro Website Inquiry</p>
			</div>

			<div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
				<p style="margin: 6px 0; font-size: 13px; color: #334155;"><strong>Sender Name:</strong> %s</p>
				<p style="margin: 6px 0; font-size: 13px; color: #334155;"><strong>Sender Email:</strong> <a href="mailto:%s" style="color: #0284c7; text-decoration: none;">%s</a></p>
				<p style="margin: 6px 0; font-size: 13px; color: #334155;"><strong>Phone:</strong> %s</p>
				<p style="margin: 6px 0; font-size: 13px; color: #334155;"><strong>Inquiry Category:</strong> %s</p>
			</div>

			<div style="background-color: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 20px;">
				<h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 13px; text-transform: uppercase;">Message Content:</h4>
				<p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">%s</p>
			</div>

			<div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
				PuzzlePro Contact System • ResultsPro Support (hello@resultspro.ng)
			</div>
		</div>
	`, name, senderEmail, senderEmail, phone, category, message)

	text := fmt.Sprintf("New contact message from %s (%s, Phone: %s, Category: %s):\n\n%s", name, senderEmail, phone, category, message)

	return m.SendEmail(to, subject, html, text)
}

