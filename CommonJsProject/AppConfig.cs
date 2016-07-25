using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonJsProject
{
    public static class AppConfig
    {
        /// <summary>
        /// 应用程序根目录  AppDomain.CurrentDomain.SetupInformation.ApplicationBase
        /// </summary>
        public static string BasePath = AppDomain.CurrentDomain.BaseDirectory;
        /// <summary>
        /// 获取配置文件节点
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public static string GetConfig(string key)
        {
            return ConfigurationManager.AppSettings[key];
        }

    }
}
