import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Globe } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'SOS', symbol: 'S', name: 'Somali Shilling' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní' },
  { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
  { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' },
  { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  { code: 'SRD', symbol: 'Sr$', name: 'Surinamese Dollar' },
  { code: 'GYD', symbol: 'G$', name: 'Guyanese Dollar' },
  { code: 'FKP', symbol: '£', name: 'Falkland Islands Pound' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia and Herzegovina Convertible Mark' },
  { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'EUR', symbol: '€', name: 'Euro (Eurozone)' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'KGS', symbol: 'лв', name: 'Kyrgyzstani Som' },
  { code: 'TJS', symbol: 'ЅМ', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },
  { code: 'UZS', symbol: 'лв', name: 'Uzbekistani Som' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  { code: 'MVR', symbol: '.ރ', name: 'Maldivian Rufiyaa' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'LAK', symbol: '₭', name: 'Lao Kip' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'BND', symbol: 'B$', name: 'Brunei Dollar' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'MOP', symbol: 'P', name: 'Macanese Pataca' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'KPW', symbol: '₩', name: 'North Korean Won' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
];

interface CurrencySettings {
  currency_code: string;
  currency_symbol: string;
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
}

export const CurrencySettings: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState<CurrencySettings>({
    currency_code: 'USD',
    currency_symbol: '$',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrencySettings();
  }, [user]);

  const loadCurrencySettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('currency_code, currency_symbol, decimal_places, thousand_separator, decimal_separator')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading currency settings:', error);
        return;
      }

      if (data) {
        setSettings({
          currency_code: 'USD',
          currency_symbol: '$',
          decimal_places: 2,
          thousand_separator: 'none',
          decimal_separator: '.'
        });
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrencySettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Currency settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving currency settings:', error);
      toast({
        title: "Error",
        description: "Failed to save currency settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setSettings({
        ...settings,
        currency_code: currency.code,
        currency_symbol: currency.symbol
      });
    }
  };

  const formatPreview = (amount: number) => {
    const parts = amount.toFixed(settings.decimal_places).split('.');
    const separator = settings.thousand_separator === 'none' ? '' : settings.thousand_separator;
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return `${settings.currency_symbol}${parts.join(settings.decimal_separator)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Currency Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={settings.currency_code}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{currency.symbol}</span>
                      <span>{currency.code}</span>
                      <span className="text-gray-500">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="symbol">Currency Symbol</Label>
            <Input
              id="symbol"
              value={settings.currency_symbol}
              onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              placeholder="$"
            />
          </div>

          <div>
            <Label htmlFor="decimal_places">Decimal Places</Label>
            <Select
              value={settings.decimal_places.toString()}
              onValueChange={(value) => setSettings({ ...settings, decimal_places: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (No decimals)</SelectItem>
                <SelectItem value="1">1 decimal place</SelectItem>
                <SelectItem value="2">2 decimal places</SelectItem>
                <SelectItem value="3">3 decimal places</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="thousand_separator">Thousand Separator</Label>
            <Select
              value={settings.thousand_separator}
              onValueChange={(value) => setSettings({ ...settings, thousand_separator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">, (Comma)</SelectItem>
                <SelectItem value=".">{`. (Period)`}</SelectItem>
                <SelectItem value=" "> (Space)</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="decimal_separator">Decimal Separator</Label>
            <Select
              value={settings.decimal_separator}
              onValueChange={(value) => setSettings({ ...settings, decimal_separator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=".">{`. (Period)`}</SelectItem>
                <SelectItem value=",">, (Comma)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <Label className="text-sm font-medium text-gray-700">Preview</Label>
          <div className="mt-2 space-y-1">
            <div className="text-lg font-semibold">{formatPreview(1234.56)}</div>
            <div className="text-sm text-gray-600">{formatPreview(999999.99)}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={saveCurrencySettings}
            disabled={saving}
            className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
          >
            {saving ? 'Saving...' : 'Save Currency Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};