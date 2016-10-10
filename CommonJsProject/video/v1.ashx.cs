using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace CommonJsProject.video
{
    /// <summary>
    /// v1 的摘要说明
    /// </summary>
    public class v1 : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string file = AppConfig.BasePath + @"video\src\1\output.m3u8";

            context.Response.ContentType = "application/octet-stream";

            //context.Server.Transfer("113.mp4");
            //FileStream fs = new FileStream(@"C:\Bill\Project\test\test\testh264.mp4", FileMode.Open);
            FileStream fs = new FileStream(file, FileMode.Open);
            context.Response.AddHeader("Content-Length", fs.Length.ToString());

            byte[] fsbb = new byte[fs.Length];
            fs.Read(fsbb, 0, (int)fs.Length);
            context.Response.OutputStream.Write(fsbb, 0, (int)fs.Length);
            fs.Close();
            context.Response.Flush();
            context.Response.End();


   
    }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}