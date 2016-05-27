using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CommonJsProject.Controllers
{
    public class FileController : Controller
    {
        // GET: File
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult UploadFile(HttpPostedFileBase file)
        {
            try
            {
                if (file.FileName == "大话设计模式.pdf")
                {
                    return Json(new { code = -1000, msg = "服务器忙" });
                }
                file.SaveAs(AppDomain.CurrentDomain.BaseDirectory + "uploadfiles\\" + Path.GetFileName(file.FileName));
                return Json(new { code = 0, msg = "success", result = Guid.NewGuid() });
            }
            catch (Exception ex)
            {
                return Json(new { code = -1000, msg = ex.Message, result = "" });
            }
        }
        [HttpPost]
        public ActionResult DeleteFile(string id)
        {
            Guid guid = new Guid();
            if (Guid.TryParse(id, out guid))
            {
                return Json(new { code = 0, msg = "success", result = "" });
            }
            else
            {
                return Json(new { code = 100, msg = "guid格式不对", result = "" });
            }
        }
    }
}