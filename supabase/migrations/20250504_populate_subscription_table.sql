-- Migration: Populate subscription table and create triggers
-- Date: 2025-05-04

-- First, populate the subscription table with existing users and their workflow counts
INSERT INTO public.subscription (id, number_workflows, subscription)
SELECT 
  p.id,
  COUNT(w.id)::int4,
  false  -- Default to false since assinatura column doesn't exist
FROM 
  public.profiles p
LEFT JOIN 
  public.workflows w ON p.id = w.user_id
GROUP BY 
  p.id;

-- Create a function to update the number_workflows count
CREATE OR REPLACE FUNCTION public.update_subscription_workflow_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- For INSERT operations
  IF (TG_OP = 'INSERT') THEN
    -- Increment the workflow count for the user
    UPDATE public.subscription
    SET 
      number_workflows = number_workflows + 1,
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
      INSERT INTO public.subscription (id, number_workflows, subscription)
      VALUES (NEW.user_id, 1, false);
    END IF;
    
    RETURN NEW;
  
  -- For DELETE operations
  ELSIF (TG_OP = 'DELETE') THEN
    -- Decrement the workflow count for the user
    UPDATE public.subscription
    SET 
      number_workflows = GREATEST(0, number_workflows - 1),
      updated_at = now()
    WHERE id = OLD.user_id;
    
    RETURN OLD;
  
  -- For UPDATE operations (if user_id changes)
  ELSIF (TG_OP = 'UPDATE' AND OLD.user_id <> NEW.user_id) THEN
    -- Decrement count for old user
    UPDATE public.subscription
    SET 
      number_workflows = GREATEST(0, number_workflows - 1),
      updated_at = now()
    WHERE id = OLD.user_id;
    
    -- Increment count for new user
    UPDATE public.subscription
    SET 
      number_workflows = number_workflows + 1,
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- If no record exists for new user, create one
    IF NOT FOUND THEN
      INSERT INTO public.subscription (id, number_workflows, subscription)
      VALUES (NEW.user_id, 1, false);
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create triggers on the workflows table
DROP TRIGGER IF EXISTS workflows_subscription_insert_trigger ON public.workflows;
CREATE TRIGGER workflows_subscription_insert_trigger
AFTER INSERT ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_subscription_workflow_count();

DROP TRIGGER IF EXISTS workflows_subscription_delete_trigger ON public.workflows;
CREATE TRIGGER workflows_subscription_delete_trigger
AFTER DELETE ON public.workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_subscription_workflow_count();

DROP TRIGGER IF EXISTS workflows_subscription_update_trigger ON public.workflows;
CREATE TRIGGER workflows_subscription_update_trigger
AFTER UPDATE ON public.workflows
FOR EACH ROW
WHEN (OLD.user_id IS DISTINCT FROM NEW.user_id)
EXECUTE FUNCTION public.update_subscription_workflow_count();

-- Add comment to the function
COMMENT ON FUNCTION public.update_subscription_workflow_count() IS 'Automatically updates the number_workflows count in the subscription table when workflows are created, deleted, or transferred to another user';
