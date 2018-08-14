using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ZSFund.Component
{
    /// <summary>
    /// 全局配置
    /// </summary>
    public class DefaultConfiguration
    {
        public static IConfiguration Default { get; set; }
        static DefaultConfiguration()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json");

            Default = builder.Build();
        }
    }
}
