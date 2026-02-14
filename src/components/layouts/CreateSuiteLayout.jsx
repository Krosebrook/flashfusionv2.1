/**
 * CreateSuiteLayout - Background wrapper for all CREATE suite pages
 * Applies the futuristic neon background with FlashFusion branding
 */
export default function CreateSuiteLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688e6b52232282004e98fe60/dd778d35a_ChatGPTImageJan14202609_43_55PM.png)',
        }}
      />
      
      {/* Overlay to ensure content readability */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[hsl(var(--surface-primary))]/80 via-transparent to-[hsl(var(--surface-primary))]/80" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}