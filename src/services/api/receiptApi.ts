
import { supabase } from '@/integrations/supabase/client';

export interface ReceiptTemplate {
  id: string;
  salon_id: string;
  template_name: string;
  header_text?: string;
  footer_text?: string;
  logo_url?: string;
  include_service_details: boolean;
  include_staff_name: boolean;
  include_salon_info: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReceiptTemplate {
  template_name: string;
  header_text?: string;
  footer_text?: string;
  logo_url?: string;
  include_service_details?: boolean;
  include_staff_name?: boolean;
  include_salon_info?: boolean;
  is_default?: boolean;
}

export const receiptApi = {
  async getTemplates() {
    const { data, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('template_name');

    if (error) throw error;
    return data || [];
  },

  async getDefaultTemplate() {
    const { data, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createTemplate(template: CreateReceiptTemplate) {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) throw new Error('User not authenticated');

    // If this is set as default, unset other defaults first
    if (template.is_default) {
      await supabase
        .from('receipt_templates')
        .update({ is_default: false })
        .eq('salon_id', profile.user.id);
    }

    const { data, error } = await supabase
      .from('receipt_templates')
      .insert([{
        ...template,
        salon_id: profile.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, updates: Partial<CreateReceiptTemplate>) {
    // If this is set as default, unset other defaults first
    if (updates.is_default) {
      const { data: profile } = await supabase.auth.getUser();
      if (profile.user) {
        await supabase
          .from('receipt_templates')
          .update({ is_default: false })
          .eq('salon_id', profile.user.id)
          .neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('receipt_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('receipt_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async generateReceiptData(appointmentId: string, templateId?: string) {
    // Get appointment with services
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;

    // Get appointment services
    const { data: services, error: servicesError } = await supabase
      .from('appointment_services')
      .select('*')
      .eq('appointment_id', appointmentId);

    if (servicesError) throw servicesError;

    // Get salon profile
    const { data: salon, error: salonError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', appointment.salon_id)
      .single();

    if (salonError) throw salonError;

    // Get staff info if available
    let staff = null;
    if (appointment.staff_id) {
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', appointment.staff_id)
        .single();

      if (!staffError) staff = staffData;
    }

    // Get template
    let template = null;
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('receipt_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!templateError) template = templateData;
    }

    if (!template) {
      template = await this.getDefaultTemplate();
    }

    return {
      appointment,
      services: services || [],
      salon,
      staff,
      template
    };
  }
};
