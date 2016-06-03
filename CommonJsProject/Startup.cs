using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CommonJsProject.Startup))]
namespace CommonJsProject
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
           
        }
    }
}
