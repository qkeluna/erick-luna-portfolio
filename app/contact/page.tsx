"use client";

import React, {
    useState,
    useCallback,
} from "react";
import { addToast } from "@heroui/react";
import emailjs from "@emailjs/browser";

import { ContactFormData, ContactPageState } from "@/components/contact/types";
import { PageHeader } from "@/components/page-header";
import { ContactCard } from "@/components/contact/contact-card";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactMap } from "@/components/contact/contact-map";
import { DATA } from "@/data";

const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

const ContactPage: React.FC = () => {
  const [state, setState] = useState<ContactPageState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const handleSubmit = useCallback(
    async (formData: ContactFormData): Promise<void> => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      const missingVars = Object.entries(EMAIL_CONFIG)
        .filter(([_, value]) => !value)
        .map(([key]) => `NEXT_PUBLIC_EMAILJS_${key.toUpperCase().replace(/([A-Z])/g, "_$1")}`);

      if (missingVars.length > 0) {
        // eslint-disable-next-line no-console
        console.error("Email configuration is incomplete:", missingVars);
        addToast({
          title: "Failed to Send Message",
          description: "Email configuration is incomplete. Please check environment variables.",
          color: "danger",
        });
        setState((prev) => ({ ...prev, isSubmitting: false }));

        return;
      }

      try {
        // Validate form data
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
          throw new Error('All form fields are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error('Please enter a valid email address');
        }

        // Initialize EmailJS if not already done
        emailjs.init(EMAIL_CONFIG.publicKey!);

        const templateParams = {
          from_name: formData.name.trim(),
          from_email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          to_name: 'Erick Luna', // Add your name as recipient
        };

        // eslint-disable-next-line no-console
        console.log('Sending email with config:', {
          serviceId: EMAIL_CONFIG.serviceId,
          templateId: EMAIL_CONFIG.templateId,
          publicKey: EMAIL_CONFIG.publicKey ? '[REDACTED]' : 'MISSING',
          templateParams: {
            ...templateParams,
            from_email: '[REDACTED]'
          }
        });

        // Test the configuration values
        // eslint-disable-next-line no-console
        console.log('Config validation:', {
          serviceIdValid: !!EMAIL_CONFIG.serviceId && EMAIL_CONFIG.serviceId !== 'your_service_id',
          templateIdValid: !!EMAIL_CONFIG.templateId && EMAIL_CONFIG.templateId !== 'your_template_id',
          publicKeyValid: !!EMAIL_CONFIG.publicKey && EMAIL_CONFIG.publicKey !== 'your_public_key'
        });

        const result = await emailjs.send(
          EMAIL_CONFIG.serviceId!,
          EMAIL_CONFIG.templateId!,
          templateParams,
          EMAIL_CONFIG.publicKey!,
        );

        // eslint-disable-next-line no-console
        console.log('EmailJS Success:', result);

        setState((prev) => ({ ...prev, isSuccess: true }));
        addToast({
          title: "Message Sent Successfully",
          description:
            "Thank you for your message! I'll get back to you soon.",
          color: "success",
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('EmailJS Error Details:', error);
        // eslint-disable-next-line no-console
        console.error('Error type:', typeof error);
        // eslint-disable-next-line no-console
        console.error('Error constructor:', error?.constructor?.name);
        // eslint-disable-next-line no-console
        console.error('Error properties:', Object.getOwnPropertyNames(error));
        
        // For EmailJS errors, check for common properties
        if (error && typeof error === 'object') {
          // eslint-disable-next-line no-console
          console.error('Error status:', (error as any).status);
          // eslint-disable-next-line no-console
          console.error('Error text:', (error as any).text);
          // eslint-disable-next-line no-console
          console.error('Error message:', (error as any).message);
        }
        
        let errorMessage = "Failed to send message. Please try again later.";
        
        // Handle EmailJS-specific error structure
        if (error && typeof error === 'object') {
          const emailError = error as any;
          
          if (emailError.status) {
            switch (emailError.status) {
              case 400:
                errorMessage = "Invalid request. Please check if all form fields are filled correctly.";
                break;
              case 403:
                errorMessage = "Access denied. Please verify your EmailJS public key and template permissions.";
                break;
              case 404:
                errorMessage = "EmailJS service or template not found. Please check your configuration.";
                break;
              case 422:
                errorMessage = "Invalid template parameters. Please check your EmailJS template configuration.";
                break;
              default:
                errorMessage = `EmailJS error (${emailError.status}): ${emailError.text || 'Unknown error'}`;
            }
          } else if (emailError.text) {
            errorMessage = emailError.text;
          } else if (emailError.message) {
            errorMessage = emailError.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({ ...prev, error: errorMessage }));
        addToast({
          title: "Failed to Send Message",
          description: errorMessage,
          color: "danger",
        });
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  return (
    <section className="py-20">
      <PageHeader texts={DATA.morphingTexts.contact} />
      <div className="container mx-auto px-4">
        <ContactCard heading={DATA.contact.heading}>
          <ContactMap src={DATA.contact.location.mapSrc} />
          <ContactForm
            isSubmitting={state.isSubmitting}
            isSuccess={state.isSuccess}
            onReset={handleReset}
            onSubmit={handleSubmit}
          />
        </ContactCard>

        {state.error && (
          <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700 text-sm">{state.error}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactPage;