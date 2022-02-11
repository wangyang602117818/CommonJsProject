using Microsoft.Office.Interop.Word;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CommonJsProject.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public void doc()
        {
            bool result = false;
            Microsoft.Office.Interop.Word.Application application = new Microsoft.Office.Interop.Word.Application();
            Microsoft.Office.Interop.Word.Document document = null;
            try
            {
                application.Visible = false;

                document = application.Documents.Open(@"C:\Users\18518\Documents\1.docx");

                string PDFPath = AppDomain.CurrentDomain.BaseDirectory + "1.pdf";//pdf存放位置
                if (!System.IO.File.Exists(@PDFPath))//存在PDF，不需要继续转换
                {
                    document.ExportAsFixedFormat(PDFPath, Microsoft.Office.Interop.Word.WdExportFormat.wdExportFormatPDF,CreateBookmarks: WdExportCreateBookmarks.wdExportCreateWordBookmarks);
                }
                result = true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                result = false;
            }
            finally
            {
                //document.Close();
            }
        }
        public void excel()
        {

        }

    }
}