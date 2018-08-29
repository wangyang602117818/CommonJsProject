using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CommonJsProject.Controllers
{
    public class VideoController : Controller
    {
        // GET: Video
        public ActionResult Index()
        {
            string file = AppConfig.BasePath + @"video\src\1\output.m3u8";
            return File(file, "application/x-mpegURL");
            
        }
        public ActionResult GetTs(int id)
        {
            string filename = "output" + id + ".ts";
            string file = AppConfig.BasePath + @"video\src\1\output\" + filename;
            return File(file, "video/vnd.dlna.mpeg-tts");
        }
        public ActionResult Key()
        {
            return Content("N74kEdQDwUgiR5QNyMQ9fg==");
        }
    }
}