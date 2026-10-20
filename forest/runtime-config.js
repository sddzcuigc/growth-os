// Public configuration only. Never place database tokens here.
{
  const origin=window.__TAURI_INTERNALS__?'https://growth-os-ten-pearl.vercel.app':location.origin;
  window.FOREST_RUNTIME = {
    api: origin+'/api/forest-sync',
    health: origin+'/api/forest-health',
    signInReturnUrl: origin+'/forest/'
  };
}
