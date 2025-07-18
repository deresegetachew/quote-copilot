export const cleanupExpiredProcessedEvtsFn = `
  CREATE OR REPLACE FUNCTION cleanup_expired_processed_events()
  RETURNS INTEGER AS $$
  DECLARE
      deleted_count INTEGER := 0;
      batch_size INTEGER := 1000;
      total_deleted INTEGER := 0;
  BEGIN
      LOOP
          DELETE FROM event_inbox 
          WHERE id IN (
              SELECT id FROM event_inbox 
              WHERE expires_at < NOW() 
                AND status IN ('completed', 'failed') 
                AND processed_at IS NOT NULL
              LIMIT batch_size
              FOR UPDATE SKIP LOCKED
          );
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          total_deleted := total_deleted + deleted_count;
          
          IF deleted_count = 0 THEN
              EXIT;
          END IF;
          
          PERFORM pg_sleep(0.1);
      END LOOP;
      
      RETURN total_deleted;
  END;
  $$ LANGUAGE plpgsql;

  CREATE INDEX IF NOT EXISTS idx_event_inbox_cleanup 
      ON event_inbox (expires_at, status, processed_at) 
      WHERE status IN ('completed', 'failed') AND processed_at IS NOT NULL;

  CREATE INDEX IF NOT EXISTS idx_event_inbox_id_cleanup
      ON event_inbox (id)
      WHERE expires_at < NOW() AND status IN ('completed', 'failed');
`;
