using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ZSFund.Component.Entity.DataCenterEntity;

namespace ZSFund.Component.Entity.DataCenterEntity
{
    public partial class MyDbContext : DbContext
    {
        public virtual DbSet<StockBasicInfo_HK> StockBasicInfo_HK { get; set; }
        public virtual DbSet<StockBasicInfo> StockBasicInfo { get; set; }

        public MyDbContext() : base()
        {
        }
        public MyDbContext(DbContextOptions options) : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(DefaultConfiguration.Default.GetConnectionString("DbConnection"), o => o.CommandTimeout(60000));
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }
    }
}
