-- Create enum type for egress status
CREATE TYPE egress_status AS ENUM ('pending', 'approved', 'rejected');

-- Create egress (支出) table
CREATE TABLE egress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_amount NUMERIC(12, 2) NOT NULL CHECK (item_amount >= 0),
  item_comment TEXT,
  invoice_date DATE NOT NULL,
  invoice_files TEXT[] DEFAULT '{}',
  transfer_date DATE,
  transfer_fee NUMERIC(12, 2) CHECK (transfer_fee >= 0),
  transfer_files TEXT[] DEFAULT '{}',
  status egress_status NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingress (收入) table
CREATE TABLE ingress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingress_date DATE NOT NULL,
  ingress_amount NUMERIC(12, 2) NOT NULL CHECK (ingress_amount >= 0),
  ingress_comment TEXT,
  ingress_files TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_egress_invoice_date ON egress(invoice_date);
CREATE INDEX idx_egress_status ON egress(status);
CREATE INDEX idx_egress_user_id ON egress(user_id);
CREATE INDEX idx_egress_created_at ON egress(created_at DESC);

CREATE INDEX idx_ingress_date ON ingress(ingress_date);
CREATE INDEX idx_ingress_user_id ON ingress(user_id);
CREATE INDEX idx_ingress_created_at ON ingress(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_egress_updated_at
  BEFORE UPDATE ON egress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingress_updated_at
  BEFORE UPDATE ON ingress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE egress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingress ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allow all operations for authenticated users
-- You can modify these policies based on your requirements

-- Egress policies
CREATE POLICY "Users can view their own egress records"
  ON egress FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own egress records"
  ON egress FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own egress records"
  ON egress FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own egress records"
  ON egress FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Ingress policies
CREATE POLICY "Users can view their own ingress records"
  ON ingress FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own ingress records"
  ON ingress FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own ingress records"
  ON ingress FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own ingress records"
  ON ingress FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

