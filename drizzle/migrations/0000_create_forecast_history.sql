CREATE TABLE public.forecast_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  model TEXT NOT NULL,
  range TEXT NOT NULL,
  forecast_price NUMERIC NOT NULL,
  last_price NUMERIC NOT NULL,
  forecast_delta NUMERIC NOT NULL,
  validation_accuracy NUMERIC NOT NULL,
  mae NUMERIC NOT NULL,
  rmse NUMERIC NOT NULL,
  r2 NUMERIC NOT NULL,
  forecast_for_date DATE NOT NULL,
  actual_price NUMERIC,
  actualized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.forecast_history TO anon;
GRANT SELECT, INSERT, UPDATE ON public.forecast_history TO authenticated;
GRANT ALL ON public.forecast_history TO service_role;

ALTER TABLE public.forecast_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forecast history"
ON public.forecast_history
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can save forecast history"
ON public.forecast_history
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update forecast outcomes"
ON public.forecast_history
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE INDEX forecast_history_symbol_model_created_idx
ON public.forecast_history (symbol, model, created_at DESC);